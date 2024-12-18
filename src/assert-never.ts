export default (value: never): never => {
  throw new Error(`Unexpected value ${value}`);
};
