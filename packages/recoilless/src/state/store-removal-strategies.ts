export type UnscheduleRemoval = () => void;
export type ScheduleRemoval = () => void;
export type RemoveFromStore = () => void;

export interface BaseSchedulerFactoryOptions<Schedule extends string> {
  schedule: Schedule;
}

type RemovalSchedulerFactory<
  Options extends BaseSchedulerFactoryOptions<string>,
> = (
  options: Options,
  removeFromStore: RemoveFromStore,
) => {
  schedule: ScheduleRemoval;
  unschedule: UnscheduleRemoval;
};

export interface SynchronousRemovalFactoryOptions
  extends BaseSchedulerFactoryOptions<"synchronous"> {}

const makeScheduleSynchronousRemoval: RemovalSchedulerFactory<
  SynchronousRemovalFactoryOptions
> = (
  options: SynchronousRemovalFactoryOptions,
  removeFromStore: RemoveFromStore,
) => ({
  schedule: () => {
    removeFromStore();
  },
  unschedule: () => {},
});

export interface DelayedRemovalFactoryOptions {
  schedule: "delayed";
  delay: number;
}

const makeScheduleDelayedRemoval: RemovalSchedulerFactory<
  DelayedRemovalFactoryOptions
> = (
  options: DelayedRemovalFactoryOptions,
  removeFromStore: RemoveFromStore,
) => {
  let removalTimeout: ReturnType<typeof setTimeout> | undefined = undefined;

  return {
    schedule: () => {
      clearTimeout(removalTimeout);
      removalTimeout = setTimeout(() => {
        removeFromStore();
      }, options.delay);
    },
    unschedule: () => {
      clearTimeout(removalTimeout);
    },
  };
};

export type StoreRemovalSchedule =
  | SynchronousRemovalFactoryOptions
  | DelayedRemovalFactoryOptions;

const schedulerFactories: {
  [Schedule in StoreRemovalSchedule["schedule"]]: RemovalSchedulerFactory<
    Extract<StoreRemovalSchedule, { schedule: Schedule }>
  >;
} = {
  delayed: makeScheduleDelayedRemoval,
  synchronous: makeScheduleSynchronousRemoval,
};

export const makeScheduler = (
  options: StoreRemovalSchedule,
  removeFromStore: RemoveFromStore,
): {
  schedule: ScheduleRemoval;
  unschedule: UnscheduleRemoval;
} => {
  return schedulerFactories[options.schedule](
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    options as any,
    removeFromStore,
  );
};
