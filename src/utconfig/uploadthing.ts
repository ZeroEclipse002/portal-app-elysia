import { auth } from "@/lib/auth";
import { UTApi, createUploadthing, type FileRouter } from "uploadthing/server";

export const utapi = new UTApi({
    token: import.meta.env.UPLOADTHING_TOKEN,
});


const f = createUploadthing()

export const portalFileRoute = {
    imageUploader: f({
        image: {
            maxFileSize: "4MB",
            maxFileCount: 1,
        },
    })
        // Set permissions and file types for this FileRoute
        .middleware(async ({ req }) => {
            // This code runs on your server before upload
            const user = await auth.api.getSession({
                headers: req.headers
            })

            // If you throw, the user will not be able to upload
            if (!user) throw new Error("Unauthorized");

            // Whatever is returned here is accessible in onUploadComplete as `metadata`
            return { userId: user.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            console.log("Upload complete for userId:", metadata.userId);

            console.log("file url", file.url);

            // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
            return { uploadedBy: metadata.userId };
        }),
} satisfies FileRouter