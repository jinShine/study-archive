export const getDirtyValues = (data: any, dirtyFields: any): any => {
  const dirtyValues: any = {};

  Object.keys(dirtyFields).forEach((key) => {
    const currentField = dirtyFields[key];

    if (typeof currentField === "object" && currentField !== null && !Array.isArray(currentField)) {
      const childDirtyValues = getDirtyValues(data[key], currentField);
      if (Object.keys(childDirtyValues).length > 0) {
        dirtyValues[key] = childDirtyValues;
      }
    } else if (currentField === true) {
      dirtyValues[key] = data[key];
    }
  });

  return dirtyValues;
};