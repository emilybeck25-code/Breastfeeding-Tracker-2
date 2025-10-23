export enum FeedingSide {
  Left = 'Left',
  Right = 'Right',
}

export interface SingleFeed {
  side: FeedingSide;
  duration: number; // in seconds
  endTime: number; // timestamp
}

export interface FeedingUnit {
  id: string;
  sessions: SingleFeed[];
  endTime: number; // timestamp of the last session
}

export enum Page {
    Tracker = 'Tracker',
    DailySummary = 'DailySummary',
    MonthlySummary = 'MonthlySummary',
    Notifications = 'Notifications',
}