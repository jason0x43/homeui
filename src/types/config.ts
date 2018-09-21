export interface Config {
  /**
   * An object of rooms. The room ID is a UUID; it may be client-generated.
   */
  rooms: { [id: string]: Room };

  /**
   * An object of device properties. These will override actual device
   * properties in the UI.
   */
  devices: { [id: string]: { type: string } };

  /** A list of deviceIds that should not be shown in the UI */
  hidden: string[];
}

export interface Room {
  id: string;
  name: string;
  deviceIds: string[];
}
