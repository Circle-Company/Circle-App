export default function NumberConversor(number) {

    const invertNumber = InvertStr(number) 
    
    if( number.length < 4) {
        return number

    }else if(number.length > 3 && number.length < 7){
        if(number .length == 4){
            return ( InvertStr( invertNumber.substring(3,6) ) + '.' + InvertStr( invertNumber.substring(2,3) ) + ' K' )            
        }else{
            return ( InvertStr( invertNumber.substring(3,6) ) + ' K' )            
           
        }

    }else if(number.length > 6 && number.length < 10){
        if(number .length == 7){
            return ( InvertStr( invertNumber.substring(6,9) ) + '.' + InvertStr( invertNumber.substring(5,6) ) + ' M' )            
        }else{
            return ( InvertStr( invertNumber.substring(6,9) ) + ' M' )
        }

    }else if(number.length > 9 && number.length < 13){
        if(number .length == 10){
            return ( InvertStr( invertNumber.substring(9,12) ) + '.' + InvertStr( invertNumber.substring(8,9) ) + ' B' )
        }else{
            return ( InvertStr( invertNumber.substring(9,12) ) + ' B' )
        }

    }else{
        return number
    }
}


export function InvertStr(str){
    return(
        str.split("").reverse().join("")
    )
}