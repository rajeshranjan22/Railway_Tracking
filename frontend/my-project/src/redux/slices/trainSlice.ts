import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Train {
  _id: string;
  trainNumber: string;
  trainName: string;
  sourceStation: any;
  destinationStation: any;
  currentStatus?: string;
  delayInMinutes?: number;
}

interface TrainState {
  trains: Train[];
  searchResults: Train[];
  currentTrain: any | null;
  liveStatus: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: TrainState = {
  trains: [],
  searchResults: [],
  currentTrain: null,
  liveStatus: null,
  loading: false,
  error: null,
};

const trainSlice = createSlice({
  name: 'train',
  initialState,
  reducers: {
    setTrains: (state, action: PayloadAction<Train[]>) => {
      state.trains = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<Train[]>) => {
      state.searchResults = action.payload;
    },
    setCurrentTrain: (state, action: PayloadAction<any>) => {
      state.currentTrain = action.payload;
    },
    setLiveStatus: (state, action: PayloadAction<any>) => {
      state.liveStatus = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setTrains, setSearchResults, setCurrentTrain, setLiveStatus, setLoading, setError } = trainSlice.actions;
export default trainSlice.reducer;
