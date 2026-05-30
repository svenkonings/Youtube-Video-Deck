import type {Channel} from "$lib/model/Channel";
import {channelGroupFromChannel, copyChannelGroup, type ChannelGroup} from "$lib/model/ChannelGroup";

export type ChannelEntry = Channel & {id: string};
export type ChannelGroupEntry = Omit<ChannelGroup, "channels"> & {id: string; channels: ChannelEntry[]};
export type SettingsEntry = ChannelEntry | ChannelGroupEntry;

export function ChannelEntry(nextId: () => string, channel: Channel): ChannelEntry {
  return {id: nextId(), ...channel, playlists: [...channel.playlists]};
}

export function ChannelGroupEntry(nextId: () => string, channelGroup: ChannelGroup): ChannelGroupEntry {
  return {id: nextId(), ...channelGroup, channels: channelGroup.channels.map(c => ChannelEntry(nextId, c))};
}

export function SettingsEntry(nextId: () => string, channelGroup: ChannelGroup): SettingsEntry {
  if (channelGroup.channels.length === 1 && channelGroup.name === channelGroup.channels[0].title) {
    return ChannelEntry(nextId, channelGroup.channels[0]);
  } else {
    return ChannelGroupEntry(nextId, channelGroup);
  }
}

export function settingsEntryToChannelGroup(entry: SettingsEntry): ChannelGroup {
  if (isChannelEntry(entry)) {
    return channelGroupFromChannel(entry);
  } else {
    return copyChannelGroup(entry);
  }
}

export function isChannelEntry(entry: SettingsEntry): entry is ChannelEntry {
  return "channelId" in entry;
}

export function isChannelGroupEntry(entry: SettingsEntry): entry is ChannelGroupEntry {
  return "channels" in entry;
}
