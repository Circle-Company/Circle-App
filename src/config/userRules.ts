/**
 * User Rules - Função Simples para Validação de Input
 *
 * Retorna os valores das regras utilizadas em cada função de validação
 */

export function userRules() {
    return {
        // Regras de username
        username: {
            required: true,
            minLength: 4,
            maxLength: 20,
            allowedCharacters: /^[a-zA-Z0-9@._]+$/,
            cannotStartWith: "@",
            cannotEndWith: "@",
            cannotContainConsecutive: true,
            allowAtPrefix: false,
            allowedSpecialCharacters: ["@", ".", "_"],
            forbiddenSpecialCharacters: [
                "!",
                "#",
                "$",
                "%",
                "^",
                "&",
                "*",
                "(",
                ")",
                "+",
                "=",
                "[",
                "]",
                "{",
                "}",
                "|",
                "\\",
                ":",
                ";",
                '"',
                "'",
                "<",
                ">",
                ",",
                "?",
                "/",
                " ",
            ],
            onlyAlphaNumeric: false,
            requireSpecialCharacters: false,
        },

        // Regras de name
        name: {
            minLength: 2,
            maxLength: 100,
            required: false,
            allowedCharacters: /^[a-zA-ZÀ-ÿ\s]+$/,
            requireOnlyLetters: true,
            requireFullName: false,
            forbiddenNames: ["admin", "root", "system", "user", "test"],
            cannotContainNumbers: true,
            cannotContainSpecialChars: true,
            requireCapitalization: true,
            cannotStartWith: " ",
            cannotEndWith: " ",
        },

        // Regras de searchMatchTerm
        searchMatchTerm: {
            minLength: 4,
            maxLength: 200,
        },

        // Regras de description
        description: {
            minLength: 10,
            maxLength: 300,
            required: false,
            allowedCharacters: /^[a-zA-ZÀ-ÿ0-9\s.,!?@#$%^&*()_+\-=\[\]{}|\\:";'<>\/]+$/,
            forbiddenWords: ["spam", "scam", "fake", "bot"],
            requireAlphanumeric: false,
            cannotStartWith: " ",
            cannotEndWith: " ",
            allowUrls: true,
            allowMentions: true,
            allowHashtags: true,
        },

        // Regras de password - Totalmente permissivas
        password: {
            minLength: 1,
            maxLength: 1000,
            passwordUpdateDays: 365,
            requireUppercase: false,
            requireLowercase: false,
            requireNumbers: false,
            requireSpecialChars: false,
            allowedSpecialChars: [], // Permite todos os caracteres
            forbiddenSpecialChars: [], // Nenhum caractere é proibido
            requireCommonPasswords: false,
            forbiddenWords: [], // Nenhuma palavra é proibida
            cannotContainUsername: false,
            cannotContainEmail: false,
            cannotStartWith: "",
            cannotEndWith: "",
            cannotBeRepeatedChars: false,
            cannotBeSequentialChars: false,
            requireDigitAtPosition: false,
        },

        // Regras de hashtag
        hashtag: {
            requiredPrefix: "#",
            minLength: 2,
            maxLength: 50,
            allowedCharacters: /^[a-zA-Z0-9_]+$/,
            cannotStartWith: " ",
            cannotEndWith: " ",
        },

        // Regras de URL
        url: {
            requireProtocol: true,
            allowedProtocols: ["http", "https"],
            minLength: 10,
            maxLength: 2048,
        },
    }
}
