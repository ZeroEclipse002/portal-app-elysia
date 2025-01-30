import { atom } from "nanostores";

export const layoutValues = atom<number[]>([1, 2, 3, 4])

export function setLayoutValues(values: any[]) {
    // Convert the mapped array into an array of numbers
    const numericValues = values.map(Number)
    layoutValues.set(numericValues)
}