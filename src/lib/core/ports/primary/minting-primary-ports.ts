export interface MintingInputPort {
    execute(): void
}

export interface MintingOutputPort {
    presentSuccess(): void
    presentError(): void
}