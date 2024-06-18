import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import RespositoryService from '../../services/RespositoryService';
import { RootState } from '../store';
import ApiService, { ApiRequest, ApiResponse } from '../../services/ApiService';

export type NewThingDTO = ApiRequest<typeof api.client.things.create.$post>['json'];

interface ThingState {
  newThing: NewThingDTO | undefined;
  userThings: {
    home: ApiResponse<typeof api.client.things.mine.today.$get, 200>;
    all: ApiResponse<typeof api.client.things.mine.today.all.$get, 200>;
  };
  otherThings: {
    home: ApiResponse<typeof api.client.things.others.today.$get, 200>;
  };
  loading: boolean;
  error: string | undefined;
}

const initialState: ThingState = {
  newThing: {
    name: '',
    description: '',
    schedule: {} as any,
    sharedUsernames: []
  },
  userThings: {
    home: [],
    all: []
  },
  otherThings: {
    home: []
  },
  loading: false,
  error: undefined
};

const api = new ApiService();

export const getUserThingsToday = createAsyncThunk('thing/getUserThingsToday', async (_, { rejectWithValue }) => {
  const response = await api.call(api.client.things.mine.today.$get, {});
  if (response.ok) {
    const data = await response.json();
    return data;
  }
  return rejectWithValue({});
});

export const getUserThingsTodayAll = createAsyncThunk('thing/getUserThingsTodayAll', async (_, { rejectWithValue }) => {
  const response = await api.call(api.client.things.mine.today.all.$get, {});
  if (response.ok) {
    const data = await response.json();
    return data;
  }
  return rejectWithValue({});
});

export const getOtherThingsToday = createAsyncThunk('thing/getOtherThingsToday', async (_, { rejectWithValue }) => {
  const response = await api.call(api.client.things.others.today.$get, {});
  if (response.ok) {
    const data = await response.json();
    return data;
  }
  return rejectWithValue({});
});

export const createThing = createAsyncThunk('thing/createThing', async (_, { rejectWithValue, getState }) => {
  const thing = (getState() as RootState).thingReducer.newThing;

  if (!thing) {
    return rejectWithValue({});
  }

  const response = await api.call(api.client.things.create.$post, { json: thing });
  if (response.ok) {
    const data = await response.json();
    return data;
  }

  return rejectWithValue({});
});

const thingSlice = createSlice({
  name: 'thing',
  initialState,
  reducers: {
    setNewPersonalThing: (state, action: PayloadAction<NewThingDTO>) => {
      state.newThing = action.payload;
    },
    resetNewPersonalThing: (state) => {
      state.newThing = undefined;
    },
    setScheduleForNewPersonalThing: (state, action: PayloadAction<NewThingDTO['schedule']>) => {
      state.newThing!.schedule = action.payload;
    },
    setNameForNewPersonalThing: (state, action: PayloadAction<string>) => {
      state.newThing!.name = action.payload;
    },
    setDescriptionForNewPersonalThing: (state, action: PayloadAction<string>) => {
      state.newThing!.description = action.payload;
    },
    setSharedUserNamesForNewPersonalThing: (state, action: PayloadAction<string[]>) => {
      state.newThing!.sharedUsernames = action.payload;
    }
  },
  extraReducers: (builder) => {
    // getUserThingsToday
    builder.addCase(getUserThingsToday.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getUserThingsToday.fulfilled, (state, action) => {
      state.loading = false;
      state.userThings.home = action.payload;
    });
    builder.addCase(getUserThingsToday.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as any;
    });

    // getOtherThingsToday
    builder.addCase(getOtherThingsToday.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getOtherThingsToday.fulfilled, (state, action) => {
      state.loading = false;
      state.otherThings.home = action.payload;
    });
    builder.addCase(getOtherThingsToday.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as any;
    });

    // getUserThingsTodayAll
    builder.addCase(getUserThingsTodayAll.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getUserThingsTodayAll.fulfilled, (state, action) => {
      state.loading = false;
      state.userThings.all = action.payload;
    });
    builder.addCase(getUserThingsTodayAll.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as any;
    });

    // createThing
    builder.addCase(createThing.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createThing.fulfilled, (state, action) => {
      state.loading = false;
      // state.personalThings.today.push(action.payload);
    });
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
  setScheduleForNewPersonalThing: setOccuranceForNewPersonalThing,
  setNameForNewPersonalThing,
  setDescriptionForNewPersonalThing,
  setSharedUserNamesForNewPersonalThing
} = thingSlice.actions;
