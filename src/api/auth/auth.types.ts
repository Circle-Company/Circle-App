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
