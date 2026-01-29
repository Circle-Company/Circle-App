export type SignInProps = {
    username: string
    password: string
}

export type SignUpProps = {
    username: string
    password: string
}

export interface signWithAppleProps {
    authorizationCode: string
    identityToken: string
    email?: string
    fullName: {
        givenName: string
        familyName: string
    }
    realUserStatus: number
    user: string
}

export type refreshTokenProps = {
    id: string
    username: string
}
