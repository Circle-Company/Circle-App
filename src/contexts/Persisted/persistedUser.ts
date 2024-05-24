import create from 'zustand';
import { storage } from '../../store';
import { storageKeys } from './storageKeys';
import { UserRootProps, userReciveDataProps } from '../../components/user_show/user_show-types';
import { UserDataType } from './types';
const storageKey = storageKeys().user;

export interface UserState {
    id: number;
    username: string;
    description: string;
    verified: boolean;
    profile_picture: {
        small_resolution: string;
        tiny_resolution: string;
    };
    setId: (value: number) => void;
    setUsername: (value: string) => void;
    setDescription: (value: string) => void;
    setVerified: (value: boolean) => void;
    setProfilePicture: (value: {
        small_resolution: string;
        tiny_resolution: string;
    }) => void;
    setUser: (value: UserDataType) => void
    loadUserFromStorage: () => void;
    removeUserFromStorage: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    id: storage.getNumber(storageKey.id) || 0,
    username: storage.getString(storageKey.username) || '',
    description: storage.getString(storageKey.description) || '',
    verified: storage.getBoolean(storageKey.verifyed) || false,
    profile_picture: {
        small_resolution: storage.getString(storageKey.profile_picture.small) || '',
        tiny_resolution: storage.getString(storageKey.profile_picture.tiny) || ''
    },

    setId: (value: number) => {
        storage.set(storageKey.id, value);
        set({ id: value });
    },
    setUsername: (value: string) => {
        storage.set(storageKey.username, value);
        set({ username: value });
    },
    setDescription: (value: string) => {
        storage.set(storageKey.description, value);
        set({ description: value });
    },
    setVerified: (value: boolean) => {
        storage.set(storageKey.verifyed, value);
        set({ verified: value });
    },
    setProfilePicture: (value: {
        small_resolution: string;
        tiny_resolution: string;
    }) => {
        storage.set(storageKey.profile_picture.small, value.small_resolution)
        storage.set(storageKey.profile_picture.tiny, value.tiny_resolution)
        set({ profile_picture: value });
    },
    setUser: (value: UserDataType) => {
        set({
            id: value.id,
            username: value.username,
            description: value.description,
            verified: value.verifyed,
            profile_picture: value.profile_picture
        })
        storage.set(storageKey.id, value.id);
        storage.set(storageKey.username, value.username);
        storage.set(storageKey.description, value.description);
        storage.set(storageKey.verifyed, value.verifyed);
        storage.set(storageKey.profile_picture.small, value.profile_picture.small_resolution)
        storage.set(storageKey.profile_picture.tiny, value.profile_picture.tiny_resolution)
    },
    loadUserFromStorage: () => {
        set({
            id: storage.getNumber(storageKey.id) || 0,
            username: storage.getString(storageKey.username) || '',
            description: storage.getString(storageKey.description) || '',
            verified: storage.getBoolean(storageKey.verifyed) || false,
            profile_picture: {
                small_resolution: storage.getString(storageKey.profile_picture.small) || '',
                tiny_resolution: storage.getString(storageKey.profile_picture.tiny) || ''
            },
        });
    },
    removeUserFromStorage: () => {
        storage.delete(storageKey.id);
        storage.delete(storageKey.username);
        storage.delete(storageKey.description);
        storage.delete(storageKey.verifyed);
        storage.delete(storageKey.profile_picture.small)
        storage.delete(storageKey.profile_picture.tiny)

        set({
            id: 0,
            username: '',
            description: '',
            verified: false,
            profile_picture: { small_resolution: '', tiny_resolution: '' },
        });
    },
}));