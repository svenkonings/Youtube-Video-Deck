/* eslint-disable no-undef */
db = db.getSiblingDB("videodeck");
db.createUser({
  user: "videodeck",
  pwd: "development",
  roles: [
    {
      role: "readWrite",
      db: "videodeck",
    },
  ],
});
db.createCollection("users");
db.users.createIndex({ sub: 1 }, { unique: true });
