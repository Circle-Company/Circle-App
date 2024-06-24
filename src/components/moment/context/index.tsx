import React, { useEffect, useMemo } from "react";
import { MomentProviderProps, MomentContextsData } from './types';
import sizes from "../../../layout/constants/sizes";
import { useMomentUserActions } from "./momentUserActions";
import { useMomentData } from "./momentData";
import { useMomentOptions } from "./momentOptions";
import PersistedContext from "../../../contexts/Persisted";
import FeedContext, { InteractionProps } from "../../../contexts/Feed";

const MomentContext = React.createContext<MomentContextsData>({} as MomentContextsData);

export function MomentProvider({
    children,
    isFeed,
    isFocused,
    momentData,
    momentSize = sizes.moment.standart
}: MomentProviderProps) {
    const { feedData, setChunkInteractionsFunc, currentChunkIds, chunkInteractions} = React.useContext(FeedContext);
    const { session } = React.useContext(PersistedContext);
    const momentDataStore = useMomentData();
    const momentUserActionsStore = useMomentUserActions();
    const momentOptionsStore = useMomentOptions();

    const isMe = useMemo(() => {
        return momentData.user?.id ? session.user.id === momentData.user.id : true;
    }, [momentData, session.user.id]);

    useEffect(() => {
        momentDataStore.setMomentData(momentData);
    }, [momentData]);

    useEffect(() => {
        momentUserActionsStore.setMomentUserActions({
            liked: false,
            shared: false,
            viewed: false,
            clickIntoMoment: false,
            watchTime: 0,
            clickProfile: false,
            commented: false,
            likeComment: false,
            skipped: false,
            showLessOften: false,
            reported: false
        });
        momentOptionsStore.setMomentOptions({
            isFeed: isFeed,
            isFocused: isFocused,
            enableAnalyticsView: isMe,
            enableModeration: true,
            enableStoreActions: isMe,
            enableTranslation: true
        });
    }, [isFeed, isFocused, isMe]);

    useEffect(() => {
        async function fetch() {
            if (currentChunkIds.includes(Number(momentDataStore.id)) && feedData) {
                const getChunkInteractions = async () => {
                    const momentData = await momentDataStore.exportMomentData();
                    const interaction = momentUserActionsStore.exportMomentUserActions();
                    const chunkData = {
                        id: momentData.id,
                        userId: momentData.userId,
                        tags: momentData.tags,
                        duration: momentData.duration,
                        type: momentData.type,
                        language: momentData.language,
                        interaction
                    };
                    setChunkInteractionsFunc(chunkData);
                };
                await getChunkInteractions();
            }            
        }; fetch()

    }, [currentChunkIds]);

    const contextValue: any = useMemo(() => ({
        momentOptions: momentOptionsStore,
        momentSize: momentSize,
        momentData: momentDataStore,
        momentUserActions: momentUserActionsStore,
    }), [momentOptionsStore, momentSize, momentDataStore, momentUserActionsStore]);

    return <MomentContext.Provider value={contextValue}>{children}</MomentContext.Provider>;
}

export default MomentContext;
