const jsonServer = require("json-server");

const db = {
  garage: [
    {
      name: "Tesla",
      color: "#e6e6fa",
      id: 1,
    },
    {
      name: "BMW",
      color: "#fede00",
      id: 2,
    },
    {
      name: "Mersedes",
      color: "#6c779f",
      id: 3,
    },
    {
      name: "Ford",
      color: "#ef3c40",
      id: 4,
    },
  ],
  winners: [
    { id: 1, wins: 1, time: 10 },
    { id: 2, wins: 56, time: 73 },
    { id: 3, wins: 32, time: 44 },
    { id: 4, wins: 89, time: 97 },
    { id: 5, wins: 14, time: 28 },
    { id: 6, wins: 67, time: 61 },
    { id: 7, wins: 42, time: 14 },
    { id: 8, wins: 5, time: 88 },
    { id: 9, wins: 78, time: 22 },
    { id: 10, wins: 23, time: 99 },
    { id: 11, wins: 68, time: 1 },
    { id: 12, wins: 37, time: 90 },
    { id: 13, wins: 90, time: 47 },
    { id: 14, wins: 9, time: 3 },
    { id: 15, wins: 45, time: 66 },
    { id: 16, wins: 12, time: 20 },
    { id: 17, wins: 98, time: 77 },
    { id: 18, wins: 21, time: 55 },
    { id: 19, wins: 76, time: 8 },
    { id: 20, wins: 34, time: 33 },
    { id: 21, wins: 55, time: 71 },
    { id: 22, wins: 1, time: 35 },
    { id: 23, wins: 78, time: 64 },
    { id: 24, wins: 89, time: 91 },
    { id: 25, wins: 21, time: 7 },
    { id: 26, wins: 44, time: 42 },
    { id: 27, wins: 99, time: 83 },
    { id: 28, wins: 33, time: 9 },
    { id: 29, wins: 67, time: 72 },
    { id: 30, wins: 14, time: 17 },
    { id: 31, wins: 65, time: 96 },
    { id: 32, wins: 7, time: 26 },
    { id: 33, wins: 23, time: 38 },
    { id: 34, wins: 89, time: 84 },
    { id: 35, wins: 49, time: 6 },
    { id: 36, wins: 32, time: 48 },
    { id: 37, wins: 82, time: 67 },
    { id: 38, wins: 11, time: 2 },
    { id: 39, wins: 78, time: 89 },
    { id: 40, wins: 96, time: 23 },
    { id: 41, wins: 17, time: 97 },
    { id: 42, wins: 38, time: 39 },
    { id: 43, wins: 79, time: 74 },
    { id: 44, wins: 24, time: 29 },
    { id: 45, wins: 51, time: 45 },
    { id: 46, wins: 8, time: 86 },
    { id: 47, wins: 93, time: 16 },
    { id: 48, wins: 33, time: 59 },
    { id: 49, wins: 61, time: 93 },
    { id: 50, wins: 3, time: 31 },
    { id: 51, wins: 86, time: 63 },
    { id: 52, wins: 22, time: 5 },
    { id: 53, wins: 47, time: 75 },
    { id: 54, wins: 97, time: 19 },
    { id: 55, wins: 29, time: 52 },
    { id: 56, wins: 64, time: 80 },
    { id: 57, wins: 2, time: 46 },
    { id: 58, wins: 78, time: 92 },
    { id: 59, wins: 88, time: 27 },
    { id: 60, wins: 10, time: 62 },
    { id: 61, wins: 36, time: 4 },
    { id: 62, wins: 94, time: 69 },
    { id: 63, wins: 12, time: 87 },
    { id: 64, wins: 57, time: 21 },
    { id: 65, wins: 39, time: 76 },
    { id: 66, wins: 83, time: 50 },
    { id: 67, wins: 5, time: 95 },
    { id: 68, wins: 70, time: 34 },
    { id: 69, wins: 16, time: 68 },
    { id: 70, wins: 73, time: 12 },
    { id: 71, wins: 85, time: 65 },
    { id: 72, wins: 28, time: 40 },
    { id: 73, wins: 40, time: 78 },
    { id: 74, wins: 62, time: 32 },
    { id: 75, wins: 4, time: 81 },
    { id: 76, wins: 81, time: 43 },
    { id: 77, wins: 19, time: 11 },
    { id: 78, wins: 52, time: 56 },
    { id: 79, wins: 92, time: 85 },
    { id: 80, wins: 35, time: 25 },
    { id: 81, wins: 60, time: 98 },
    { id: 82, wins: 6, time: 70 },
    { id: 83, wins: 46, time: 18 },
    { id: 84, wins: 87, time: 53 },
    { id: 85, wins: 15, time: 82 },
    { id: 86, wins: 31, time: 36 },
    { id: 87, wins: 74, time: 0 },
    { id: 88, wins: 84, time: 60 },
    { id: 89, wins: 25, time: 94 },
    { id: 90, wins: 54, time: 15 },
    { id: 91, wins: 41, time: 49 },
    { id: 92, wins: 91, time: 30 },
    { id: 93, wins: 27, time: 57 },
    { id: 94, wins: 58, time: 83 },
    { id: 95, wins: 71, time: 37 },
    { id: 96, wins: 13, time: 71 },
    { id: 97, wins: 48, time: 5 },
    { id: 98, wins: 80, time: 41 },
    { id: 99, wins: 30, time: 51 },
    { id: 100, wins: 63, time: 24 },
  ],

  // {
  //   id: 1,
  //   wins: 1,
  //   time: 10,
  // },
};

const server = jsonServer.create();
const router = jsonServer.router(db);
const middlewares = jsonServer.defaults();

const PORT = process.env.PORT || 3000;

const state = { velocity: {}, blocked: {} };

server.use(middlewares);

const STATUS = {
  STARTED: "started",
  STOPPED: "stopped",
  DRIVE: "drive",
};

server.patch("/engine", (req, res) => {
  const { id, status } = req.query;

  if (!id || Number.isNaN(+id) || +id <= 0) {
    return res
      .status(400)
      .send('Required parameter "id" is missing. Should be a positive number');
  }

  if (!status || !/^(started)|(stopped)|(drive)$/.test(status)) {
    return res
      .status(400)
      .send(
        `Wrong parameter "status". Expected: "started", "stopped" or "drive". Received: "${status}"`
      );
  }

  if (!db.garage.find((car) => car.id === +id)) {
    return res
      .status(404)
      .send("Car with such id was not found in the garage.");
  }

  const distance = 500000;

  if (status === STATUS.DRIVE) {
    const velocity = state.velocity[id];

    if (!velocity) {
      return res
        .status(404)
        .send(
          'Engine parameters for car with such id was not found in the garage. Have you tried to set engine status to "started" before?'
        );
    }

    if (state.blocked[id]) {
      return res
        .status(429)
        .send(
          "Drive already in progress. You can't run drive for the same car twice while it's not stopped."
        );
    }

    state.blocked[id] = true;

    const x = Math.round(distance / velocity);

    if (new Date().getMilliseconds() % 3 === 0) {
      setTimeout(() => {
        delete state.velocity[id];
        delete state.blocked[id];
        res
          .header("Content-Type", "application/json")
          .status(500)
          .send("Car has been stopped suddenly. It's engine was broken down.");
      }, (Math.random() * x) ^ 0);
    } else {
      setTimeout(() => {
        delete state.velocity[id];
        delete state.blocked[id];
        res
          .header("Content-Type", "application/json")
          .status(200)
          .send(JSON.stringify({ success: true }));
      }, x);
    }
  } else {
    const x = req.query.speed ? +req.query.speed : (Math.random() * 2000) ^ 0;

    const velocity =
      status === STATUS.STARTED ? Math.max(50, (Math.random() * 200) ^ 0) : 0;

    if (velocity) {
      state.velocity[id] = velocity;
    } else {
      delete state.velocity[id];
      delete state.blocked[id];
    }

    setTimeout(
      () =>
        res
          .header("Content-Type", "application/json")
          .status(200)
          .send(JSON.stringify({ velocity, distance })),
      x
    );
  }
});

server.use(router);
server.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
