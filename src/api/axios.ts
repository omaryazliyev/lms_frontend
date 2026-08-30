import axios from "axios";

const api = axios.create({
    baseURL: "/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
});

// Har bir so'rovga localStorage dan tokenni qo'shish
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    // FormData uchun boundary ni brauzer/axios o'zi qo'yishi kerak
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
        const headers = config.headers as any;
        if (headers?.delete) {
            headers.delete("Content-Type");
            headers.delete("content-type");
        } else if (headers) {
            delete headers["Content-Type"];
            delete headers["content-type"];
        }
    }
    return config;
});

// 401 xatoligini ushlash va loginga yo'naltirish (faqat himoyalangan sahifalardan)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (typeof window !== "undefined") {
                const publicPaths = ["/", "/login", "/register", "/courses"];
                const currentPath = window.location.pathname;
                const isPublic = publicPaths.some(p => currentPath === p || currentPath.startsWith(p + "?"));
                if (!isPublic) {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("user_role");
                    window.location.href = "/login";
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
