export default function NumberConversor(number: number) {

    const number_str = number.toString()

    const invertNumber = InvertStr(String(number)) 
    
    if( number_str.length < 4) {
        return number

    }else if(number_str.length > 3 && number_str.length < 7){
        if(number_str .length == 4){
            return ( InvertStr( invertNumber.substring(3,6) ) + '.' + InvertStr( invertNumber.substring(2,3) ) + ' K' )            
        }else{
            return ( InvertStr( invertNumber.substring(3,6) ) + ' K' )            
           
        }

    }else if(number_str.length > 6 && number_str.length < 10){
        if(number_str .length == 7){
            return ( InvertStr( invertNumber.substring(6,9) ) + '.' + InvertStr( invertNumber.substring(5,6) ) + ' M' )            
        }else{
            return ( InvertStr( invertNumber.substring(6,9) ) + ' M' )
        }

    }else if(number_str.length > 9 && number_str.length < 13){
        if(number_str .length == 10){
            return ( InvertStr( invertNumber.substring(9,12) ) + '.' + InvertStr( invertNumber.substring(8,9) ) + ' B' )
        }else{
            return ( InvertStr( invertNumber.substring(9,12) ) + ' B' )
        }

    }else{
        return Math.floor(Number(number_str))
    }
}


export function InvertStr(str: string){
    return(
        str.split("").reverse().join("")
    )
}