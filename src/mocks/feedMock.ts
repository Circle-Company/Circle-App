import { MomentProps } from "../contexts/Feed/types"

// Vídeos curtos mais realistas para simular conteúdo estilo TikTok
const videoSources = [
    // Vídeos públicos de amostra
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
]

// Descrições mais variadas
const descriptions = [
    "Momentos especiais com a família ❤️",
    "Explorando novos lugares ✨",
    "Mood de hoje 🔥",
    "Só sei que nada sei 🤔",
    "Dias melhores virão ☀️",
]

export const singleMomentMock: MomentProps = {
    id: 1,
    content_type: "MOMENT",
    user: {
        id: 123,
        username: "joaosilva",
        verifyed: true,
        profile_picture: {
            small_resolution: "https://randomuser.me/api/portraits/men/1.jpg",
            tiny_resolution: "https://randomuser.me/api/portraits/men/1.jpg",
        },
        isFollowing: false,
    },
    description: "Meu primeiro moment! 🔥",
    midia: {
        content_type: "VIDEO",
        nhd_thumbnail: "https://randomuser.me/api/portraits/men/1.jpg",
        fullhd_resolution: videoSources[0],
        nhd_resolution: videoSources[0],
    },
    comments_count: 5,
    lastComment: {
        id: 101,
        user: {
            id: 456,
            username: "mariaoliveira",
            verifyed: false,
            profile_picture: {
                small_resolution: "https://randomuser.me/api/portraits/women/2.jpg",
                tiny_resolution: "https://randomuser.me/api/portraits/women/2.jpg",
            },
            isFollowing: true,
        },
        content: "Muito legal! 👏 Adorei esse momento!",
        statistics: {
            total_likes_num: 8,
        },
        created_at: new Date(Date.now() - 300000).toISOString(), // 5 minutos atrás
    },
    likes_count: 42,
    isLiked: false,
    deleted: false,
    created_at: new Date().toISOString(),
}

// Criar um array de diferentes momentos
export const feedMock: MomentProps[] = [
    // Primeiro momento (original)
    singleMomentMock,

    // Segundo momento (modificado)
    {
        ...singleMomentMock,
        id: 2,
        description: descriptions[1],
        midia: {
            content_type: "VIDEO",
            nhd_thumbnail: "https://randomuser.me/api/portraits/women/2.jpg",
            fullhd_resolution: videoSources[1],
            nhd_resolution: videoSources[1],
        },
        comments_count: 2,
        lastComment: {
            id: 102,
            user: {
                id: 789,
                username: "carlosoliveira",
                verifyed: true,
                profile_picture: {
                    small_resolution: "https://randomuser.me/api/portraits/men/4.jpg",
                    tiny_resolution: "https://randomuser.me/api/portraits/men/4.jpg",
                },
                isFollowing: false,
            },
            content: "Incrível! 🔥",
            statistics: {
                total_likes_num: 8,
            },
            created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
        },
        likes_count: 89,
        isLiked: true,
    },

    // Terceiro momento (modificado)
    {
        ...singleMomentMock,
        id: 3,
        description: descriptions[2],
        user: {
            ...singleMomentMock.user,
            id: 456,
            username: "anasilva",
            profile_picture: {
                small_resolution: "https://randomuser.me/api/portraits/women/3.jpg",
                tiny_resolution: "https://randomuser.me/api/portraits/women/3.jpg",
            },
        },
        midia: {
            content_type: "VIDEO",
            nhd_thumbnail: "https://randomuser.me/api/portraits/women/3.jpg",
            fullhd_resolution: videoSources[2],
            nhd_resolution: videoSources[2],
        },
        comments_count: 1,
        lastComment: {
            id: 103,
            user: {
                id: 321,
                username: "juliaferreira",
                verifyed: false,
                profile_picture: {
                    small_resolution: "https://randomuser.me/api/portraits/women/5.jpg",
                    tiny_resolution: "https://randomuser.me/api/portraits/women/5.jpg",
                },
                isFollowing: true,
            },
            content: "Adorei! ✨",
            statistics: {
                total_likes_num: 5,
            },
            created_at: new Date(Date.now() - 7200000).toISOString(), // 2 horas atrás
        },
        likes_count: 234,
        isLiked: false,
    },

    // Quarto momento (sem comentários)
    {
        ...singleMomentMock,
        id: 4,
        description: descriptions[3],
        user: {
            ...singleMomentMock.user,
            id: 789,
            username: "carlosoliveira",
            verifyed: false,
            profile_picture: {
                small_resolution: "https://randomuser.me/api/portraits/men/4.jpg",
                tiny_resolution: "https://randomuser.me/api/portraits/men/4.jpg",
            },
        },
        midia: {
            content_type: "VIDEO",
            nhd_thumbnail: "https://randomuser.me/api/portraits/men/4.jpg",
            fullhd_resolution: videoSources[3],
            nhd_resolution: videoSources[3],
        },
        comments_count: 0,
        lastComment: undefined,
        likes_count: 127,
        isLiked: true,
    },

    // Quinto momento (modificado)
    {
        ...singleMomentMock,
        id: 5,
        description: descriptions[4],
        user: {
            ...singleMomentMock.user,
            id: 321,
            username: "juliaferreira",
            profile_picture: {
                small_resolution: "https://randomuser.me/api/portraits/women/5.jpg",
                tiny_resolution: "https://randomuser.me/api/portraits/women/5.jpg",
            },
        },
        midia: {
            content_type: "VIDEO",
            nhd_thumbnail: "https://randomuser.me/api/portraits/women/5.jpg",
            fullhd_resolution: videoSources[4],
            nhd_resolution: videoSources[4],
        },
        comments_count: 5,
        lastComment: {
            id: 104,
            user: {
                id: 555,
                username: "pedrosilva",
                verifyed: true,
                profile_picture: {
                    small_resolution: "https://randomuser.me/api/portraits/men/6.jpg",
                    tiny_resolution: "https://randomuser.me/api/portraits/men/6.jpg",
                },
                isFollowing: false,
            },
            content: "Que momento incrível! 😍",
            statistics: {
                total_likes_num: 12,
            },
            created_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutos atrás
        },
        likes_count: 531,
        isLiked: false,
    },
]

// Para simular a resposta da API
export const mockApiResponse = {
    data: feedMock,
    status: 200,
    message: "Success",
}
