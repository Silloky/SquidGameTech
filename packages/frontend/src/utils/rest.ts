const bakeUrl = (path: string, params: Record<string, string>) => {
    const url = new URL(path, process.env.EXPO_PUBLIC_BASE_URL);
    url.search = new URLSearchParams(params).toString();
    return url.toString();
}

export type RestResSuccess = {
    status: number;
    data: any;
}

export type RestResError = {
    status: number;
    error: string;
}

const handleResponse = async (response: Response): Promise<RestResSuccess> => {
    if (!response.ok) {
        let error;
        try {
            const errorData = await response.json() as any;
            error = errorData.error || `Request failed with status ${response.status}`;
        } catch (e) {
            error = `Request failed with status ${response.status}`;
        }
        throw { status: response.status, error: error };
    }
    const data = await response.json();
    return { status: response.status, data: data };
};

const handleRequest = async (url: string, options: RequestInit): Promise<RestResSuccess> => {
    try {
        const response = await fetch(url, options);
        return handleResponse(response);
    } catch (error: any) {
        console.error("Request failed:", error);
        throw { status: error.code || 500, error: error.message || "Request failed due to network issues" };
    }
};

export const get = async (path: string, params: Record<string, string>): Promise<RestResSuccess> => {
    return handleRequest(bakeUrl(path, params), { method: 'GET' });
};

export const post = async (path: string, data: any, params: Record<string, string>): Promise<RestResSuccess> => {
    return handleRequest(bakeUrl(path, params), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
};

export const put = async (path: string, data: any, params: Record<string, string>): Promise<RestResSuccess> => {
    return handleRequest(bakeUrl(path, params), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
};

export const del = async (path: string, params: Record<string, string>): Promise<RestResSuccess> => {
    return handleRequest(bakeUrl(path, params), { method: 'DELETE' });
};