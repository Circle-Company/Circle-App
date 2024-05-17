import RNFetchBlob from 'rn-fetch-blob'

export default async function getImageBlob(originalPath: string) {
    try {
        const response = await RNFetchBlob.fs.readFile(originalPath, 'base64');
        const blob = `data:image/jpeg;base64,${response}`;
        return blob;
    } catch (error) {
        console.error('Erro ao obter blob da imagem:', error);
        return null;
    }
};