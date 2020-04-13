import Winreg from 'winreg';

export const getRegistryItems = ({ hive, key }) => {
  const regKey = new Winreg({ hive, key });

  return new Promise((resolve, reject) => {
    regKey.values((err, items) => {
      if (err) {
        return reject(err);
      }
      return resolve(items);
    });
  });
};
