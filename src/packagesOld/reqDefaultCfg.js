

export const reqWaysDefaultCfg = {
    defaultHeader: {},
    defaultWay: 'post',
    post: {
        dataType: "json",
        "Content-Type": "application/json; charset=utf-8",
    },
    get: {},
    // xssProtection: {
    //     "X-XSS-Protection": "1; mode=block",
    //     "X-Content-Type-Options": "nosniff",
    // },
    nocache: {
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
        Expires: 0,
    },
}
