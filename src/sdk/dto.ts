export type BaseSuccessDTO<TData> = {
    status: "success";
    data: TData;
}

export type BaseErrorDTO = {
    status: "error";
    message: string;
}

export type BaseDTO<TData> = BaseSuccessDTO<TData> | BaseErrorDTO;