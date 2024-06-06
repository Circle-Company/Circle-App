import create from 'zustand';
import { storage } from '../../store';
import { storageKeys } from './storageKeys';
import { UserRootProps, userReciveDataProps } from '../../components/user_show/user_show-types';
import { UserDataType } from './types';
import api from '../../services/api';
const storageKey = storageKeys().user;

export interface UserState {
    id: number
    name: string
    username: string;
    description: string;
    verified: boolean;
    profile_picture: {
        small_resolution: string;
        tiny_resolution: string;
    };
    setId: (value: number) => void;
    setName: (value: string) => void;
    setUsername: (value: string) => void;
    setDescription: (value: string) => void;
    setVerified: (value: boolean) => void;
    setProfilePicture: (value: {
        small_resolution: string;
        tiny_resolution: string;
    }) => void;
    setUser: (value: UserDataType) => void
    getUser: (id: number) => Promise<UserState>
    loadUserFromStorage: () => void;
    removeUserFromStorage: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    id: storage.getNumber(storageKey.id) || 0,
    name: storage.getString(storageKey.name) || '',
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
    setName: (value: string) => {
        storage.set(storageKey.name, value);
        set({ name: value });
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
    getUser: async (id: number) => {
        try{
            const response = await api.post(`/user/session/data/pk/${id}`, { user_id: id })
            .then(function (response) {
                const user = response.data
                set({
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    description: user.description,
                    verified: user.verifyed,
                    profile_picture: user.profile_picture
                })
                storage.set(storageKey.id, user.id);
                storage.set(storageKey.name, user.name)
                storage.set(storageKey.username, user.username);
                storage.set(storageKey.description, user.description);
                storage.set(storageKey.verifyed, user.verifyed);
                storage.set(storageKey.profile_picture.small, user.profile_picture.small_resolution)
                storage.set(storageKey.profile_picture.tiny, user.profile_picture.tiny_resolution)
                return response.data
             })
            .catch(function (error) { console.log(error)})
            return response
        } catch(err) {
            console.error(err)
        } 

    },
    setUser: (value: UserDataType) => {
        set({
            id: value.id,
            name: value.name,
            username: value.username,
            description: value.description,
            verified: value.verifyed,
            profile_picture: value.profile_picture
        })
        storage.set(storageKey.id, value.id);
        storage.set(storageKey.name, value.name)
        storage.set(storageKey.username, value.username);
        storage.set(storageKey.description, value.description);
        storage.set(storageKey.verifyed, value.verifyed);
        storage.set(storageKey.profile_picture.small, value.profile_picture.small_resolution)
        storage.set(storageKey.profile_picture.tiny, value.profile_picture.tiny_resolution)
    },
    loadUserFromStorage: () => {
        set({
            id: storage.getNumber(storageKey.id) || 0,
            name: storage.getString(storageKey.name) || '',
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
        storage.delete(storageKey.name);
        storage.delete(storageKey.username);
        storage.delete(storageKey.description);
        storage.delete(storageKey.verifyed);
        storage.delete(storageKey.profile_picture.small)
        storage.delete(storageKey.profile_picture.tiny)

        set({
            id: 0,
            name: '',
            username: '',
            description: '',
            verified: false,
            profile_picture: { small_resolution: '', tiny_resolution: '' },
        });
    },
}));