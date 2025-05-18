import { db } from "@/db";
import { concernBoard, familyData, requests, requestUpdateForm, requestUpdatesChat, sectionSequence, user, userDetails } from "@/db/schema";
import { auth } from "@/lib/auth";
import { ActionError, defineAction, type ActionAPIContext } from "astro:actions";
import { z } from "astro:schema";
import { and, arrayContains, eq, or } from "drizzle-orm";
import { admin } from "./admin";
import { utapi } from "@/utconfig/uploadthing";
import { UTFile } from "uploadthing/server";


export const server = {
    init: defineAction({
        accept: 'form',
        input: z.object({
            name: z.string(),
            email: z.string().email(),
            password: z.string(),
        }),
        handler: async (input, context) => {

            console.log(input)

            const noAdmin = await db.query.user.findFirst({
                where: (table, { eq }) => eq(table.role, 'admin')
            })

            if (noAdmin) {
                throw new ActionError({
                    code: 'CONFLICT',
                    message: 'Admin already exists'
                })
            }

            const data = await auth.api.signUpEmail({
                body: {
                    name: input.name,
                    email: input.email,
                    password: input.password,
                    role: 'admin',
                    approved: true
                }
            })

            await db.update(user).set({
                role: 'admin'
            }).where(eq(user.id, data.user.id))

            const sequence = await db.select().from(sectionSequence).limit(1)

            if (sequence.length === 0) {
                await db.insert(sectionSequence).values({
                    id: '1',
                    sequence: [1, 2, 3, 4]
                })
            }

            return {
                success: true
            }
        }
    }),
    initDetails: defineAction({
        accept: 'json',
        input: z.object({
            personalDetails: z.object({
                firstName: z.string(),
                lastName: z.string(),
                phone: z.string().regex(/^\d{11}$/, {
                    message: 'Phone number must be 11 digits'
                }),
                birthDate: z.string().date().refine(date => new Date(date) < new Date(), {
                    message: 'Birth date must be in the past'
                }),
                gender: z.string(),
                birthPlace: z.string(),
                yearsOfResidence: z.string(),
                completeAddress: z.string(),
                currentAddress: z.string(),
            }),
            familyMembers: z.array(z.object({
                fullName: z.string(),
                birthDate: z.string().date().refine(date => new Date(date) < new Date(), {
                    message: 'Birth date must be in the past'
                }),
                gender: z.string(),
                relationship: z.string(),
                email: z.string().email().optional(),
                phone: z.string().regex(/^\d{11}$/, {
                    message: 'Phone number must be 11 digits'
                }).optional(),
                birthPlace: z.string(),
                yearsOfResidence: z.string(),
                completeAddress: z.string(),
                currentAddress: z.string(),
            })).min(1, {
                message: 'Please add at least one family member'
            })
        }),
        handler: async (input, context) => {
            console.log(input)

            await AuthMiddleware(context)

            await new Promise(resolve => setTimeout(resolve, 2000))

            await db.transaction(async tx => {
                await tx.insert(userDetails).values({
                    ...input.personalDetails,
                    userId: context.locals.user?.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })

                const familyDataRes = await tx.insert(familyData).values({
                    data: input.familyMembers.map((member, index) => ({
                        ...member,
                        id: index
                    })),
                    userId: context.locals.user?.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }).returning()

                console.log(familyDataRes)
            })

            return {
                success: true
            }
        }
    }),
    createRequest: defineAction({
        accept: 'form',
        input: z.object({
            requestType: z.string(),
            otherRequestType: z.string().optional(),
            requestDetails: z.string().optional(),
            idPicture: z.instanceof(File).refine(file => file.type.startsWith('image/') && file.size <= 1 * 1024 * 1024, {
                message: 'Please upload a valid image file (max 1MB)'
            }),
            familyMemberId: z.string().optional(),
            purpose: z.string().optional()
        }).refine(data => data.requestType === 'other' ? !!data.otherRequestType : true, {
            message: 'Please specify the type of request',
            path: ['otherRequestType']
        }),
        handler: async (input, context) => {
            try {
                if (!input.idPicture.type.startsWith('image/')) {
                    throw new ActionError({
                        code: 'BAD_REQUEST',
                        message: 'Please upload a valid image file'
                    });
                }

                if (input.idPicture.size > 1 * 1024 * 1024) {
                    throw new ActionError({
                        code: 'BAD_REQUEST',
                        message: 'File size must be less than 1MB'
                    });
                }

                await ApprovedMiddleware(context)

                console.log('Request received:', {
                    ...input,
                    idPicture: {
                        type: input.idPicture.type,
                        size: input.idPicture.size
                    }
                })

                const dataRes = await db.transaction(async tx => {

                    const reqNumber = await tx.$count(requests, and(eq(requests.userId, context.locals.user?.id as string), or(eq(requests.status, 'submitted'), eq(requests.status, 'reviewed'))))

                    if (reqNumber >= 3) {
                        throw new ActionError({
                            code: 'BAD_REQUEST',
                            message: 'You have reached the maximum number of requests'
                        })
                    }

                    const idPic = await utapi.uploadFiles(new UTFile([input.idPicture], input.idPicture.name, { type: input.idPicture.type }))

                    if (!idPic.data) {
                        throw new ActionError({
                            code: 'BAD_REQUEST',
                            message: 'Failed to upload image'
                        })
                    }

                    let docUserDetails: {
                        fullName: string;
                        birthDate: string;
                        birthPlace: string;
                        currentAddress: string;
                        yearsOfResidence: string;
                        completeAddress: string;
                        purpose: string;
                    } | null = null


                    if (input.requestType === 'document' && input.familyMemberId && input.purpose) {
                        if (input.familyMemberId !== 'selfdoc') {
                            const familyMember = await tx.query.familyData.findFirst({
                                where: (table, { eq }) => eq(table.userId, context.locals.user?.id as string)
                            })

                            if (!familyMember) {
                                throw new ActionError({
                                    code: 'BAD_REQUEST',
                                    message: 'Family member not found'
                                })
                            }

                            if (!familyMember.data.find(member => member.id === Number(input.familyMemberId))) {
                                throw new ActionError({
                                    code: 'BAD_REQUEST',
                                    message: 'You are not authorized to submit this request'
                                })
                            }

                            const familyMemberData = familyMember.data.find(member => member.id === Number(input.familyMemberId))

                            docUserDetails = {
                                fullName: familyMemberData?.fullName ?? '',
                                birthDate: familyMemberData?.birthDate ?? '',
                                birthPlace: familyMemberData?.birthPlace ?? '',
                                currentAddress: familyMemberData?.currentAddress ?? '',
                                yearsOfResidence: familyMemberData?.yearsOfResidence ?? '',
                                completeAddress: familyMemberData?.completeAddress ?? '',
                                purpose: input.purpose ?? '',
                            }

                        } else {
                            const userDetails = await tx.query.userDetails.findFirst({
                                where: (table, { eq }) => eq(table.userId, context.locals.user?.id as string)
                            })

                            if (!userDetails) {
                                throw new ActionError({
                                    code: 'BAD_REQUEST',
                                    message: 'User details not found'
                                })
                            }

                            docUserDetails = {
                                fullName: userDetails.firstName + ' ' + userDetails.lastName,
                                birthDate: userDetails.birthDate ?? '',
                                birthPlace: userDetails.birthPlace ?? '',
                                currentAddress: userDetails.currentAddress ?? '',
                                yearsOfResidence: userDetails.yearsOfResidence ?? '',
                                completeAddress: userDetails.completeAddress ?? '',
                                purpose: input.purpose ?? '',
                            }

                        }
                    }
                    const request = await tx.insert(requests).values({
                        type: input.requestType,
                        details: input.requestDetails ?? '',
                        status: 'submitted',
                        idPicture: idPic.data.key,
                        userId: context.locals.user?.id,
                        createdAt: new Date(),
                        docUserDetails: docUserDetails,
                    })

                    return {
                        success: true,
                        message: 'Request submitted successfully'
                    }

                })
            } catch (error) {
                console.error('Error processing request:', error)
                throw error
            }
        }
    }),
    addConcern: defineAction({
        accept: 'form',
        input: z.object({
            message: z.string(),
        }),
        handler: async (input, context) => {
            try {
                console.log(input)
                await ApprovedMiddleware(context)

                const concernsUser = await db.query.concernBoard.findFirst({
                    where: (table, { between, and, eq }) =>
                        and(
                            between(
                                table.createdAt,
                                new Date(new Date().toISOString().split("T")[0] + "T00:00:00.000Z"),
                                new Date(new Date().toISOString().split("T")[0] + "T23:59:59.999Z")
                            ),
                            eq(table.userId, context.locals.user?.id!)
                        ),
                });

                if (concernsUser) {
                    throw new ActionError({
                        code: 'BAD_REQUEST',
                        message: 'You have already submitted a concern for this date'
                    })
                }

                const [concern] = await db.insert(concernBoard).values({
                    userId: context.locals.user?.id,
                    message: input.message,
                    createdAt: new Date(),
                }).returning()

                return {
                    success: true,
                    message: 'Concern added successfully'
                }
            } catch (error) {
                console.error('Error adding concern:', error)
                throw error
            }
        }
    }),
    sendMessage: defineAction({
        accept: 'form',
        input: z.object({
            message: z.string(),
            requestUpdateId: z.string()
        }),
        handler: async (input, context) => {
            try {
                await ApprovedMiddleware(context)

                if (context.locals.user?.role !== 'admin') {

                    const request = await db.query.requestUpdates.findFirst({
                        where: (table, { eq }) => eq(table.id, input.requestUpdateId),
                        with: {
                            request: {
                                columns: {
                                    userId: true
                                }
                            }
                        }
                    })

                    if (!request) {
                        throw new ActionError({
                            code: 'BAD_REQUEST',
                            message: 'Request not found'
                        })
                    }

                    if (request.request?.userId !== context.locals.user?.id) {
                        throw new ActionError({
                            code: 'BAD_REQUEST',
                            message: 'You are not authorized to send messages for this request'
                        })
                    }
                }

                const [requestUpdate] = await db.insert(requestUpdatesChat).values({
                    requestLogId: input.requestUpdateId,
                    userId: context.locals.user?.id,
                    message: input.message,
                    createdAt: new Date(),
                }).returning()

                return {
                    success: true,
                    message: 'Message sent successfully'
                }
            } catch (error) {
                console.error('Error sending message:', error)
                throw error
            }
        }
    }),
    submitForm: defineAction({
        accept: 'json',
        input: z.object({
            requestUpdateId: z.string(),
            requestFormLogId: z.string(),
            formType: z.enum(['residence', 'indigency', 'clearance']),
            form: z.object({
                fullName: z.string(),
                birthDate: z.coerce.date().refine(date => new Date(date) < new Date(), {
                    message: 'Birth date must be in the past'
                }),
                completeAddress: z.string(),
                purpose: z.string(),
                yearsOfResidence: z.number().optional(),
                birthPlace: z.string(),
                currentAddress: z.string(),
            })
        }),
        handler: async (input, context) => {
            try {
                await ApprovedMiddleware(context)

                console.log(input)

                const request = await db.query.requestUpdates.findFirst({
                    where: (table, { eq }) => eq(table.id, input.requestUpdateId),
                    with: {
                        form: true,
                        request: {
                            columns: {
                                userId: true
                            }
                        }
                    }
                })

                if (!request) {
                    throw new ActionError({
                        code: 'BAD_REQUEST',
                        message: 'Request not found'
                    })
                }

                // if (request.request?.userId !== context.locals.user?.id) {
                //     throw new ActionError({
                //         code: 'BAD_REQUEST',
                //         message: 'You are not authorized to submit this form'
                //     })
                // }

                if (request.form.form !== null) {
                    throw new ActionError({
                        code: 'BAD_REQUEST',
                        message: 'Form already submitted'
                    })
                }

                const [form] = await db.update(requestUpdateForm).set({
                    form: { ...input.form, birthDate: input.form.birthDate.toISOString().split('T')[0] },
                    createdAt: new Date(),
                }).where(eq(requestUpdateForm.id, input.requestFormLogId)).returning()

                if (!form) {
                    throw new ActionError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to update form'
                    })
                }

                return {
                    success: true,
                    message: 'Form submitted successfully'
                }
            } catch (error) {
                console.error('Error submitting form:', error)
                throw error
            }
        }
    }),
    addFamilyMember: defineAction({
        accept: 'form',
        input: z.object({
            fullName: z.string(),
            birthDate: z.coerce.date().refine(date => new Date(date) < new Date(), {
                message: 'Birth date must be in the past'
            }),
            gender: z.string(),
            relationship: z.string(),
            email: z.string().email().optional(),
            phone: z.string().regex(/^\d{11}$/, {
                message: 'Phone number must be 11 digits'
            }).optional(),
            birthPlace: z.string(),
            yearsOfResidence: z.string(),
            completeAddress: z.string(),
            currentAddress: z.string(),
        }),
        handler: async (input, context) => {
            console.log("input", input)
            try {
                await ApprovedMiddleware(context)

                const familyDataRes = await db.query.familyData.findFirst({
                    where: (table, { eq }) => eq(table.userId, context.locals.user?.id!)
                })

                if (!familyDataRes) {
                    throw new ActionError({
                        code: 'BAD_REQUEST',
                        message: 'Family data not found'
                    })
                }

                const familyMember = {
                    ...input,
                    birthDate: input.birthDate.toISOString().split('T')[0],
                    id: familyDataRes.data.length + 1
                }

                const [familyMemberRes] = await db.update(familyData).set({
                    data: [...familyDataRes.data, familyMember],
                    userId: context.locals.user?.id,
                    updatedAt: new Date(),
                }).where(eq(familyData.userId, context.locals.user?.id!)).returning()

                return {
                    success: true,
                    message: 'Family member added successfully',
                    familyMemberRes
                }
            } catch (error) {
                console.error('Error adding family member:', error)
                throw new ActionError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to add family member',
                })
            }
        }
    }),
    deleteFamilyMember: defineAction({
        accept: 'form',
        input: z.object({
            id: z.string()
        }),
        handler: async (input, context) => {
            try {
                await ApprovedMiddleware(context)

                const familyDataRes = await db.query.familyData.findFirst({
                    where: (table, { eq }) => eq(table.userId, context.locals.user?.id!)
                })

                if (!familyDataRes) {
                    throw new ActionError({
                        code: 'BAD_REQUEST',
                        message: 'Family data not found'
                    })
                }

                const [familyMemberRes] = await db.update(familyData).set({
                    data: familyDataRes.data.filter(member => member.id !== Number(input.id)),
                    userId: context.locals.user?.id,
                    updatedAt: new Date(),
                }).where(eq(familyData.userId, context.locals.user?.id!)).returning()

                return {
                    success: true,
                    message: 'Family member deleted successfully',
                    familyMemberRes
                }
            } catch (error) {
                console.error('Error deleting family member:', error)
                throw new ActionError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to delete family member'
                })
            }
        }
    }),
    changePassword: defineAction({
        accept: 'form',
        input: z.object({
            currentPassword: z.string(),
            newPassword: z.string().refine(password => password.length >= 8, {
                message: 'Password must be at least 8 characters long'
            }),
            confirmPassword: z.string(),
        }).refine(data => data.newPassword === data.confirmPassword, {
            message: 'Passwords do not match',
            path: ['confirmPassword']
        }),
        handler: async (input, context) => {
            try {
                await ApprovedMiddleware(context)

                const { user } = await auth.api.changePassword({
                    body: {
                        currentPassword: input.currentPassword,
                        newPassword: input.newPassword,
                        revokeOtherSessions: true
                    },
                })

                return {
                    success: true,
                    message: 'Password changed successfully'
                }
            } catch (error) {
                console.error('Error changing password:', error)
                throw new ActionError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to change password'
                })
            }
        }
    }),
    admin
}

async function AuthMiddleware(context: ActionAPIContext) {
    if (!context.locals.user) {
        throw new ActionError({
            code: 'UNAUTHORIZED',
            message: 'Unauthorized'
        })
    }

}

async function ApprovedMiddleware(context: ActionAPIContext) {
    if (!context.locals.user) {
        throw new ActionError({
            code: 'UNAUTHORIZED',
            message: 'Unauthorized'
        })
    }
    if (context.locals.user.approved !== true) {
        throw new ActionError({
            code: 'UNAUTHORIZED',
            message: 'Unauthorized'
        })
    }
}