import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import RespositoryService from "../../services/RespositoryService";
import { RootState } from "../store";

export type PersonalThing = {
    uuid: string;
    name: string;
    description?: string;
    images?: string[];
    streakCount: number;
    startTime: string;
    endTime: string;
}

export type NewPersonalThing = {
    name: string;
    description: string;
    occurances: {
        startTime: string;
        endTime: string;
        repeat: string;
        dayOfWeek: string[];
    }[];
    sharedUserNames: string[];

}

export type OtherThings = {
    thingUuid: string;
    thingName: string;
    username: string;
    photoUuid: string;
};

interface ThingState {
    personalThings: {
        today: {
            all: PersonalThing[];
            preview: PersonalThing[];
            new: NewPersonalThing | undefined;
        };
        all: PersonalThing[];
    };
    otherThings: {
        today: OtherThings[];
    };
    loading: boolean;
    error: string | undefined;
}

const initialState: ThingState = {
    personalThings: {
        today: {
            preview: [],
            all: [],
            new: undefined,
        },
        all: [],
    },
    otherThings: {
        today: [],
    },
    loading: false,
    error: undefined,
};

export const getTodaysPersonalThingsPreview = createAsyncThunk(
    "thing/getTodaysPersonalThings",
    async (_, thunkApi) => {
        const userState = (thunkApi.getState() as RootState).authReducer;
        if (!userState.user) {
            return;
        }
        const repositoryService = new RespositoryService();
        const response = await repositoryService.thingRepository.getTodaysPersonalThings<PersonalThing[]>(userState.user.token);
        if (!response) {
            throw new Error("No response");
        }
        return response;
    }
);


export const getOtherThingsToday = createAsyncThunk(
    "thing/getOtherThingsToday",
    async (_, thunkApi) => {
        const userState = (thunkApi.getState() as RootState).authReducer;
        if (!userState.user) {
            return;
        }
        const repositoryService = new RespositoryService();
        const response = await repositoryService.thingRepository.getOtherThingsToday<OtherThings[]>(userState.user.token);
        return response;

    }
);

export const getAllTodaysPersonalThings = createAsyncThunk(
    "thing/getAllTodaysPersonalThings",
    async (_, thunkApi) => {
        const userState = (thunkApi.getState() as RootState).authReducer;
        if (!userState.user) {
            return;
        }
        const repositoryService = new RespositoryService();
        const response = await repositoryService.thingRepository.getAllTodaysPersonalThings<PersonalThing[]>(userState.user.token);

        return response;
    }
);

export const getAllPersonalThings = createAsyncThunk(
    "thing/getAllPersonalThings",
    async (_, thunkApi) => {
        const userState = (thunkApi.getState() as RootState).authReducer;
        if (!userState.user) {
            return;
        }
        const repositoryService = new RespositoryService();
        const response = await repositoryService.thingRepository.getAllPersonalThings<PersonalThing[]>(userState.user.token);

        return response;
    }
);

export const createThing = createAsyncThunk(
    "thing/createThing",
    async (data: {
        name: string;
        description: string;
        occurances: {
            startTime: string;
            endTime: string;
            repeat: string;
            dayOfWeek: string[];
        }[];
        sharedUsernames: string[];
    }, thunkApi) => {
        const userState = (thunkApi.getState() as RootState).authReducer;
        if (!userState.user) {
            return;
        }
        const repositoryService = new RespositoryService();
        console.log(JSON.stringify(data));
        const response = await repositoryService.thingRepository.createThing<PersonalThing>(data, userState.user.token);

        return response;
    }
);

const thingSlice = createSlice({
    name: "thing",
    initialState,
    reducers: {
        setNewPersonalThing: (state, action) => {
            state.personalThings.today.new = action.payload;
        },
        resetNewPersonalThing: (state) => {
            state.personalThings.today.new = undefined;
        },
        setOccuranceForNewPersonalThing: (state, action) => {
            if (!state.personalThings.today.new) {
                state.personalThings.today.new = {
                    name: "",
                    description: "",
                    occurances: [],
                    sharedUserNames: [],
                };
            }
            for (const occurance of state.personalThings.today.new.occurances) {
                if (occurance.startTime === action.payload.startTime &&
                    occurance.endTime === action.payload.endTime &&
                    occurance.repeat === action.payload.repeat &&
                    occurance.dayOfWeek.includes(action.payload.dayOfWeek) === false) {
                    occurance.dayOfWeek.push(action.payload.dayOfWeek);

                    return;
                }
            }

            state.personalThings.today.new.occurances.push(action.payload);

            console.log(JSON.stringify(state.personalThings.today.new.occurances));
        },
        setNameForNewPersonalThing: (state, action) => {
            if (!state.personalThings.today.new) {
                state.personalThings.today.new = {
                    name: "",
                    description: "",
                    occurances: [],
                    sharedUserNames: [],
                };
            }
            state.personalThings.today.new.name = action.payload;
        },
        setDescriptionForNewPersonalThing: (state, action) => {
            if (!state.personalThings.today.new) {
                state.personalThings.today.new = {
                    name: "",
                    description: "",
                    occurances: [],
                    sharedUserNames: [],
                };
            }
            state.personalThings.today.new.description = action.payload;
        },
        setSharedUserNamesForNewPersonalThing: (state, action) => {
            if (!state.personalThings.today.new) {
                state.personalThings.today.new = {
                    name: "",
                    description: "",
                    occurances: [],
                    sharedUserNames: [],
                };
            }
            state.personalThings.today.new.sharedUserNames = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getTodaysPersonalThingsPreview.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(
            getTodaysPersonalThingsPreview.fulfilled,
            (state, action) => {
                state.loading = false;
                state.personalThings.today.preview = action.payload || [];
            }
        );
        builder.addCase(getTodaysPersonalThingsPreview.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
            // Throw an error to distinguish between no response and an error response
            throw new Error(action.error.message);
        });

        builder.addCase(getOtherThingsToday.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(
            getOtherThingsToday.fulfilled,
            (state, action) => {
                state.loading = false;
                state.otherThings.today = action.payload || [];
            }
        );
        builder.addCase(getOtherThingsToday.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });

        builder.addCase(getAllTodaysPersonalThings.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(
            getAllTodaysPersonalThings.fulfilled,
            (state, action) => {
                state.loading = false;
                state.personalThings.today.all = action.payload || [];
            }
        );
        builder.addCase(getAllTodaysPersonalThings.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });

        builder.addCase(getAllPersonalThings.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(
            getAllPersonalThings.fulfilled,
            (state, action) => {
                state.loading = false;
                state.personalThings.all = action.payload || [];
            }
        );
        builder.addCase(getAllPersonalThings.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });

        builder.addCase(createThing.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(
            createThing.fulfilled,
            (state, action) => {
                state.loading = false;
                // state.personalThings.today.push(action.payload);
            }
        );
        builder.addCase(createThing.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });
    }
});


export const thingReducer = thingSlice.reducer;
export const thingSelector = (state: RootState) => state.thingReducer;
export const {
    setNewPersonalThing,
    resetNewPersonalThing,
    setOccuranceForNewPersonalThing,
    setNameForNewPersonalThing,
    setDescriptionForNewPersonalThing,
    setSharedUserNamesForNewPersonalThing,
} = thingSlice.actions;