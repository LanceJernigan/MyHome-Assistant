interface chatParams {
    role: string;
    content: string;
}

export interface reqParams {
    params: chatParams[];
}

export interface chatResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    choices: {
        message: chatParams;
        finish_reasoning: string;
        index: number;
    }[];
}