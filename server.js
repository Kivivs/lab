const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

function calculateCost(data) {
  const equipmentRates = {
    basic: 10000,
    pro: 20000,
    premium: 35000,
  };

  const { shooting_days, actors_count, equipment_type, postproduction } = data;

  if (
    shooting_days === undefined ||
    actors_count === undefined ||
    !equipment_type ||
    !postproduction
  ) {
    return { error: "Все поля обязательны." };
  }

  if (!Number.isInteger(shooting_days) || shooting_days < 1 || shooting_days > 120) {
    return { error: "Количество съемочных дней должно быть целым числом от 1 до 120." };
  }

  if (!Number.isInteger(actors_count) || actors_count < 1 || actors_count > 50) {
    return { error: "Количество актеров должно быть целым числом от 1 до 50." };
  }

  if (!["basic", "pro", "premium"].includes(equipment_type)) {
    return { error: "Тип оборудования должен быть: basic, pro или premium." };
  }

  if (!["yes", "no"].includes(postproduction)) {
    return { error: "Поле postproduction должно быть yes или no." };
  }

  const shooting_cost = shooting_days * equipmentRates[equipment_type];
  const actors_cost = actors_count * 5000;
  const postproduction_cost = postproduction === "yes" ? 30000 : 0;
  const total_cost = shooting_cost + actors_cost + postproduction_cost;

  return {
    shooting_days,
    actors_count,
    equipment_type,
    postproduction,
    shooting_cost,
    actors_cost,
    postproduction_cost,
    total_cost,
  };
}

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Калькулятор кинокомпании</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #f4f6fb;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 720px;
          margin: 40px auto;
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 4px 18px rgba(0,0,0,0.12);
          padding: 30px;
        }
        h1 {
          text-align: center;
          margin-bottom: 10px;
        }
        p {
          text-align: center;
          color: #555;
          margin-bottom: 25px;
        }
        label {
          display: block;
          margin-top: 15px;
          font-weight: bold;
        }
        input, select {
          width: 100%;
          padding: 10px;
          font-size: 16px;
          margin-top: 6px;
          border: 1px solid #ccc;
          border-radius: 8px;
          box-sizing: border-box;
        }
        button {
          width: 100%;
          margin-top: 24px;
          padding: 12px;
          font-size: 18px;
          border: none;
          border-radius: 10px;
          background: #2563eb;
          color: white;
          cursor: pointer;
        }
        button:hover {
          background: #1d4ed8;
        }
        .result, .error {
          margin-top: 24px;
          padding: 16px;
          border-radius: 10px;
          white-space: pre-line;
          display: none;
        }
        .result {
          background: #eef6ff;
        }
        .error {
          background: #ffe7e7;
          color: #a30000;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Калькулятор стоимости съемок фильма</h1>
        <p>API-сервис кинокомпании</p>

        <label for="shooting_days">Количество съемочных дней</label>
        <input type="number" id="shooting_days" min="1" max="120" value="10" />

        <label for="actors_count">Количество актеров</label>
        <input type="number" id="actors_count" min="1" max="50" value="5" />

        <label for="equipment_type">Тип оборудования</label>
        <select id="equipment_type">
          <option value="basic">Базовое</option>
          <option value="pro" selected>Профессиональное</option>
          <option value="premium">Премиум</option>
        </select>

        <label for="postproduction">Постобработка</label>
        <select id="postproduction">
          <option value="yes" selected>Да</option>
          <option value="no">Нет</option>
        </select>

        <button onclick="calculate()">Рассчитать стоимость</button>

        <div id="result" class="result"></div>
        <div id="error" class="error"></div>
      </div>

      <script>
        async function calculate() {
          const data = {
            shooting_days: parseInt(document.getElementById("shooting_days").value, 10),
            actors_count: parseInt(document.getElementById("actors_count").value, 10),
            equipment_type: document.getElementById("equipment_type").value,
            postproduction: document.getElementById("postproduction").value
          };

          const resultBox = document.getElementById("result");
          const errorBox = document.getElementById("error");

          resultBox.style.display = "none";
          errorBox.style.display = "none";

          try {
            const response = await fetch("/calculate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
              errorBox.style.display = "block";
              errorBox.innerText = result.error || "Неизвестная ошибка.";
              return;
            }

            resultBox.style.display = "block";
            resultBox.innerText =
              "Стоимость съемок: " + result.shooting_cost + " руб.\\n" +
              "Стоимость актеров: " + result.actors_cost + " руб.\\n" +
              "Стоимость постобработки: " + result.postproduction_cost + " руб.\\n" +
              "Итоговая стоимость: " + result.total_cost + " руб.";
          } catch (err) {
            errorBox.style.display = "block";
            errorBox.innerText = "Не удалось подключиться к серверу.";
          }
        }
      </script>
    </body>
    </html>
  `);
});

app.post("/calculate", (req, res) => {
  const result = calculateCost(req.body);

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://127.0.0.1:${PORT}`);
});