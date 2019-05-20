export class ConditionalCheckFailedException extends Error {

    public code: string;
    constructor(code: string, message: string) {
        super(message);
        this.code = code;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ConditionalCheckFailedException.prototype);
    }
}
