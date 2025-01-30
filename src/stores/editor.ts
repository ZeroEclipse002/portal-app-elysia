import { atom } from 'nanostores'


export const wordCount = atom<number>(0)

export const blocks = atom<any[]>([])

export const saveStatus = atom<boolean>(false)

export const postContent = atom<any[]>([])

export function addWordCount(count: number) {
    wordCount.set(count);
}

export function setSaveStatus(status: boolean) {
    saveStatus.set(status);
}

export function setPostContent(content: any[]) {
    postContent.set(content);
}