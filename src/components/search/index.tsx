import input from "./components/input/search-input"
import EmptyListCard from "./components/search-emty_list_card"
import loading_card from "./components/search-loading"
import not_typing from "./components/search-not_typing"
import offline from "./components/search-offline"
import render_user from "./components/search-render_user"

export const Search = {
    RenderUser: render_user,
    Input: input,
    Offline: offline,
    NotTyping: not_typing,
    EmptyListCard: EmptyListCard,
    LoadingCard: loading_card,
}
