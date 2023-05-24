// WordTimestampElement class that contains the word and its timestamp, and an individual audio file

export type WordTimestampElement = {
    word: string;
    startTimestamp: number;
    endTimestamp: number;
    audioSrc: string;
}
