import { userReciveDataProps } from "../../components/user_show/user_show-types"
import profile_data from '../../data/profile.json'
type SignInResponseProps = {
    accessToken: string,
    user: userReciveDataProps
}
export function SignIn():Promise<SignInResponseProps> {
    return new Promise(resolve => {
        resolve({
            accessToken: '0e2e209e2idowji2eu29jiwdo2ij2',
            user: profile_data
        })
    })
}