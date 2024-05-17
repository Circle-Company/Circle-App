import { CommentsReciveDataProps } from "../../comment/comments-types"
import { userReciveDataProps } from "../../user_show/user_show-types"
import api from "../../../services/api"
import { MomentDataProps, MomentMidiaProps, MomentStatisticsProps, TagProps } from "./types"
import { LanguagesCodesType } from "../../../locales/LanguageTypes"

export default class MomentDataClass {
    public readonly id: Number
    public readonly user: userReciveDataProps
    public readonly description: String
    public readonly midia: MomentMidiaProps
    public comments: CommentsReciveDataProps
    public statistics: MomentStatisticsProps
    public tags: TagProps[]
    public readonly language: LanguagesCodesType
    public readonly created_at: String

    constructor({
        id,
        user,
        description,
        midia,
        comments,
        statistics,
        tags,
        language,
        created_at
    }: MomentDataProps) {
        this.id = id
        this.user = user
        this.description = description
        this.midia = midia
        this.comments = comments
        this.statistics = statistics
        this.tags = tags
        this.language = language
        this.created_at = created_at
    }

    async findComments ({page, pageSize}: {page: number, pageSize: number}): Promise<void> {
        await api.post(`/moment/get-comments?page=${page}&pageSize=${pageSize}`, {moment_id: this.id})
        .then((response) => {
            if (page === 1) this.comments = response.data.comments;
            else this.comments = ([...this.comments, ...response.data.comments])
        })
        .catch(function (error) { console.log(error) });
    }

    async findStatistics() {
        await api.post('/moment/get-statistics/view', { moment_id: this.id})
        .then((response) => { this.statistics = response.data})
        .catch(function (error) { console.log(error)}) 
    }

    async findTags() {
        await api.post('/moment/get-tags?page=1&pageSize=100', { moment_id: this.id})
        .then((response) => {this.tags = (response.data)})
        .catch(function (error) { console.log(error)}) 
    }
}