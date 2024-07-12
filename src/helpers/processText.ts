type setTextToSizeProps = {
    text: string
    size: number
}

export function truncated({ text, size }: setTextToSizeProps) {
    if (text.length > size) {
        return text.slice(0, size) + "..."
    } else return text
}
