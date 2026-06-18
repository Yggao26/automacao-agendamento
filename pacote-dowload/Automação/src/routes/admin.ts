import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.type("html").send(`<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Painel Barber-bot</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --ink: #131a24;
      --paper: #f6f7fb;
      --card: #ffffff;
      --brand: #0f9d8a;
      --brand-2: #1976d2;
      --warn: #d97706;
      --ok: #15803d;
      --muted: #667085;
      --border: #e7e8ef;
      --shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: "Space Grotesk", sans-serif;
      color: var(--ink);
      background:
        radial-gradient(circle at 10% 0%, #dff8f5 0%, rgba(223, 248, 245, 0) 40%),
        radial-gradient(circle at 90% 0%, #dfeeff 0%, rgba(223, 238, 255, 0) 45%),
        var(--paper);
      min-height: 100vh;
    }

    .shell {
      width: min(1200px, 95%);
      margin: 24px auto 36px;
      display: grid;
      gap: 16px;
    }

    .hero {
      background: linear-gradient(120deg, #0f766e, #155e75 55%, #1d4ed8);
      color: #fff;
      border-radius: 18px;
      padding: 20px;
      box-shadow: var(--shadow);
      display: grid;
      gap: 10px;
    }

    .hero h1 {
      margin: 0;
      font-size: clamp(1.3rem, 2.8vw, 2.2rem);
      letter-spacing: 0.02em;
    }

    .hero p {
      margin: 0;
      color: #d8f0ff;
      font-size: 0.98rem;
      max-width: 68ch;
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      margin-top: 8px;
    }

    .toolbar input[type="date"] {
      border: 1px solid rgba(255, 255, 255, 0.35);
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      padding: 9px 11px;
      border-radius: 9px;
      font: inherit;
    }

    .toolbar button {
      border: 0;
      background: #fff;
      color: #0f172a;
      border-radius: 9px;
      padding: 9px 12px;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }

    .status {
      font-size: 0.92rem;
      color: #dff6f3;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 14px;
    }

    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      box-shadow: var(--shadow);
      padding: 14px;
    }

    .metric {
      grid-column: span 3;
      min-height: 116px;
      display: grid;
      gap: 6px;
      align-content: start;
    }

    .metric h3 {
      margin: 0;
      font-size: 0.86rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--muted);
    }

    .metric p {
      margin: 0;
      font-size: clamp(1.2rem, 2.4vw, 2.1rem);
      font-weight: 700;
    }

    .split {
      grid-column: span 6;
    }

    .split h2 {
      margin: 0 0 8px;
      font-size: 1.05rem;
    }

    .list {
      display: grid;
      gap: 8px;
      max-height: 460px;
      overflow: auto;
      padding-right: 4px;
    }

    .row {
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px;
      display: grid;
      grid-template-columns: 112px 1fr auto;
      gap: 10px;
      align-items: center;
      background: linear-gradient(120deg, #ffffff, #fbfdff);
    }

    .row .slot {
      font-weight: 700;
      color: #0f172a;
      font-size: 0.95rem;
    }

    .row .meta {
      color: var(--muted);
      font-size: 0.92rem;
    }

    .badge {
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 0.78rem;
      font-weight: 700;
      border: 1px solid transparent;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: #e7f8ee;
      color: var(--ok);
      border-color: #b6e9c8;
    }

    .forms {
      display: grid;
      gap: 12px;
    }

    .forms h3 {
      margin: 0;
      font-size: 1rem;
    }

    form {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
    }

    input, select {
      width: 100%;
      border: 1px solid var(--border);
      border-radius: 9px;
      padding: 9px 10px;
      font: inherit;
      color: var(--ink);
      background: #fff;
    }

    button.action {
      border: 0;
      border-radius: 9px;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
      color: #fff;
      background: linear-gradient(120deg, var(--brand), var(--brand-2));
      padding: 9px 10px;
    }

    .hint {
      margin-top: 6px;
      color: var(--muted);
      font-size: 0.86rem;
    }

    .notice {
      border-radius: 10px;
      padding: 10px;
      font-size: 0.9rem;
      border: 1px solid var(--border);
      background: #f8fafc;
      color: #0f172a;
    }

    .notice.ok {
      border-color: #bbf7d0;
      background: #f0fdf4;
      color: #166534;
    }

    .notice.warn {
      border-color: #fde68a;
      background: #fffbeb;
      color: #92400e;
    }

    .catalog {
      display: grid;
      gap: 8px;
      margin-top: 8px;
    }

    .catalog .item {
      border: 1px solid var(--border);
      border-radius: 9px;
      padding: 8px;
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      gap: 8px;
      background: #fbfdff;
    }

    .catalog .item strong {
      display: block;
    }

    .catalog .actions {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .btn-mini {
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 6px 8px;
      font: inherit;
      font-size: 0.82rem;
      cursor: pointer;
      background: #fff;
    }

    .btn-mini.danger {
      border-color: #fecaca;
      color: #b91c1c;
      background: #fef2f2;
    }

    @media (max-width: 940px) {
      .metric { grid-column: span 6; }
      .split { grid-column: span 12; }
      form { grid-template-columns: 1fr 1fr; }
    }

    @media (max-width: 640px) {
      .metric { grid-column: span 12; }
      .row { grid-template-columns: 1fr; }
      form { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <section class="hero">
      <h1>Painel de Agendamentos em Tempo Real</h1>
      <p>Visual pronto para cliente final: agenda ao vivo, ocupacao e configuracao rapida de horarios e servicos.</p>
      <div class="toolbar">
        <label for="date">Data:</label>
        <input id="date" type="date" />
        <button id="reload" type="button">Atualizar agora</button>
        <span class="status" id="status">Conectando stream...</span>
      </div>
    </section>

    <section class="grid">
      <article class="card metric">
        <h3>Agendamentos</h3>
        <p id="mAppointments">0</p>
      </article>
      <article class="card metric">
        <h3>Ocupacao</h3>
        <p id="mOccupancy">0%</p>
      </article>
      <article class="card metric">
        <h3>Minutos Ocupados</h3>
        <p id="mBooked">0</p>
      </article>
      <article class="card metric">
        <h3>Minutos Livres</h3>
        <p id="mFree">0</p>
      </article>

      <article class="card split">
        <h2>Agenda do Dia</h2>
        <div id="appointments" class="list"></div>
      </article>

      <article class="card split forms">
        <h3>Configuracao Rapida</h3>
        <form id="serviceForm">
          <input id="serviceName" placeholder="Nome do servico" required />
          <input id="serviceDuration" type="number" min="5" step="5" placeholder="Duracao (min)" required />
          <button class="action" type="submit">Adicionar servico</button>
          <div></div>
        </form>

        <form id="whForm">
          <select id="weekday" required>
            <option value="1">Segunda</option>
            <option value="2">Terca</option>
            <option value="3">Quarta</option>
            <option value="4">Quinta</option>
            <option value="5">Sexta</option>
            <option value="6">Sabado</option>
            <option value="7">Domingo</option>
          </select>
          <input id="start" type="time" required />
          <input id="end" type="time" required />
          <button class="action" type="submit">Adicionar horario</button>
        </form>

        <div class="hint" id="catalogInfo">Carregando catalogos...</div>
        <div class="notice" id="notice">Painel pronto para uso.</div>

        <div>
          <h3>Servicos cadastrados</h3>
          <div id="servicesList" class="catalog"></div>
        </div>

        <div>
          <h3>Horarios de funcionamento</h3>
          <div id="workingHoursList" class="catalog"></div>
        </div>
      </article>
    </section>
  </main>

  <script>
    const dateInput = document.getElementById("date");
    const statusEl = document.getElementById("status");
    const appointmentsEl = document.getElementById("appointments");
    const catalogInfoEl = document.getElementById("catalogInfo");
    const mAppointments = document.getElementById("mAppointments");
    const mOccupancy = document.getElementById("mOccupancy");
    const mBooked = document.getElementById("mBooked");
    const mFree = document.getElementById("mFree");
    const serviceForm = document.getElementById("serviceForm");
    const whForm = document.getElementById("whForm");
    const reloadBtn = document.getElementById("reload");
    const noticeEl = document.getElementById("notice");
    const servicesListEl = document.getElementById("servicesList");
    const workingHoursListEl = document.getElementById("workingHoursList");

    let stream = null;

    function showNotice(text, type) {
      noticeEl.textContent = text;
      noticeEl.className = "notice" + (type ? " " + type : "");
    }

    function weekdayLabel(weekday) {
      const labels = {
        1: "Segunda",
        2: "Terca",
        3: "Quarta",
        4: "Quinta",
        5: "Sexta",
        6: "Sabado",
        7: "Domingo",
      };
      return labels[weekday] || String(weekday);
    }

    function renderServices(services) {
      if (!services.length) {
        servicesListEl.innerHTML = '<div class="item"><span>Nenhum servico cadastrado.</span></div>';
        return;
      }

      servicesListEl.innerHTML = services.map(function (svc) {
        return '<div class="item">'
          + '<div><strong>' + svc.name + '</strong><span>' + svc.duration + ' min</span></div>'
          + '<div class="actions">'
          + '<button class="btn-mini" data-action="edit-service" data-id="' + svc.id + '" data-name="' + svc.name + '" data-duration="' + svc.duration + '">Editar</button>'
          + '<button class="btn-mini danger" data-action="delete-service" data-id="' + svc.id + '">Remover</button>'
          + '</div>'
          + '</div>';
      }).join('');
    }

    function renderWorkingHours(workingHours) {
      if (!workingHours.length) {
        workingHoursListEl.innerHTML = '<div class="item"><span>Nenhum horario cadastrado.</span></div>';
        return;
      }

      workingHoursListEl.innerHTML = workingHours.map(function (wh) {
        return '<div class="item">'
          + '<div><strong>' + weekdayLabel(wh.weekday) + '</strong><span>' + wh.start + ' - ' + wh.end + '</span></div>'
          + '<div class="actions">'
          + '<button class="btn-mini danger" data-action="delete-wh" data-id="' + wh.id + '">Remover</button>'
          + '</div>'
          + '</div>';
      }).join('');
    }

    function todayISO() {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      return yyyy + "-" + mm + "-" + dd;
    }

    function render(summary) {
      mAppointments.textContent = String(summary.totals.appointments);
      mOccupancy.textContent = String(summary.totals.occupancyPercent) + "%";
      mBooked.textContent = String(summary.totals.bookedMinutes);
      mFree.textContent = String(summary.totals.freeMinutes);

      if (!summary.appointments.length) {
        appointmentsEl.innerHTML = '<div class="row"><div class="meta">Sem agendamentos nesta data.</div></div>';
        return;
      }

      appointmentsEl.innerHTML = summary.appointments.map(function (a) {
        return '<div class="row">'
          + '<div class="slot">' + a.start.slice(11) + ' - ' + a.end.slice(11) + '</div>'
          + '<div><strong>' + a.clientName + '</strong><div class="meta">' + a.serviceName + ' (' + a.serviceDuration + ' min) - ' + a.clientPhone + '</div></div>'
          + '<div class="badge">' + a.status + '</div>'
          + '</div>';
      }).join('');
    }

    function connectStream() {
      if (stream) stream.close();
      statusEl.textContent = "Conectando stream...";
      const date = dateInput.value;
      stream = new EventSource('/api/admin/stream?date=' + encodeURIComponent(date));

      stream.onmessage = function (event) {
        const data = JSON.parse(event.data);
        render(data);
        statusEl.textContent = "Ao vivo - ultima atualizacao: " + new Date().toLocaleTimeString();
      };

      stream.onerror = function () {
        statusEl.textContent = "Stream com problema. Tentando reconectar...";
      };
    }

    async function loadCatalogs() {
      const [servicesRes, whRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/working-hours'),
      ]);

      const services = await servicesRes.json();
      const wh = await whRes.json();

      const servicesText = services.length + " servico(s)";
      const whText = wh.length + " faixa(s) de horario";
      catalogInfoEl.textContent = servicesText + " configurados e " + whText + " para funcionamento.";
      renderServices(services);
      renderWorkingHours(wh);
    }

    serviceForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      const name = document.getElementById('serviceName').value.trim();
      const duration = Number(document.getElementById('serviceDuration').value);
      if (!name || !duration || duration <= 0) {
        showNotice('Preencha nome e duracao maior que zero.', 'warn');
        return;
      }

      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, duration: duration }),
      });

      if (!response.ok) {
        showNotice('Nao foi possivel adicionar o servico.', 'warn');
        return;
      }

      document.getElementById('serviceName').value = '';
      document.getElementById('serviceDuration').value = '';
      await loadCatalogs();
      connectStream();
      showNotice('Servico adicionado com sucesso.', 'ok');
    });

    whForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      const weekday = Number(document.getElementById('weekday').value);
      const start = document.getElementById('start').value;
      const end = document.getElementById('end').value;

      if (!start || !end || start >= end) {
        showNotice('Horario invalido. O inicio precisa ser menor que o fim.', 'warn');
        return;
      }

      const response = await fetch('/api/working-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekday: weekday, start: start, end: end }),
      });

      if (!response.ok) {
        showNotice('Nao foi possivel adicionar o horario.', 'warn');
        return;
      }

      document.getElementById('start').value = '';
      document.getElementById('end').value = '';
      await loadCatalogs();
      connectStream();
      showNotice('Horario adicionado com sucesso.', 'ok');
    });

    servicesListEl.addEventListener('click', async function (event) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const action = target.getAttribute('data-action');
      if (!action) return;

      if (action === 'delete-service') {
        const id = target.getAttribute('data-id');
        if (!id) return;
        const confirmed = window.confirm('Remover este servico?');
        if (!confirmed) return;

        const response = await fetch('/api/services/' + id, { method: 'DELETE' });
        if (!response.ok) {
          showNotice('Falha ao remover servico. Pode estar vinculado a agendamento.', 'warn');
          return;
        }
        await loadCatalogs();
        showNotice('Servico removido.', 'ok');
      }

      if (action === 'edit-service') {
        const id = target.getAttribute('data-id');
        const currentName = target.getAttribute('data-name') || '';
        const currentDuration = target.getAttribute('data-duration') || '';
        if (!id) return;

        const newName = window.prompt('Novo nome do servico:', currentName);
        if (!newName) return;
        const newDurationRaw = window.prompt('Nova duracao em minutos:', currentDuration);
        const newDuration = Number(newDurationRaw);
        if (!newDuration || newDuration <= 0) {
          showNotice('Duracao invalida.', 'warn');
          return;
        }

        const response = await fetch('/api/services/' + id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName.trim(), duration: newDuration }),
        });

        if (!response.ok) {
          showNotice('Falha ao editar servico.', 'warn');
          return;
        }

        await loadCatalogs();
        showNotice('Servico atualizado.', 'ok');
      }
    });

    workingHoursListEl.addEventListener('click', async function (event) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const action = target.getAttribute('data-action');
      if (action !== 'delete-wh') return;

      const id = target.getAttribute('data-id');
      if (!id) return;
      const confirmed = window.confirm('Remover este horario de funcionamento?');
      if (!confirmed) return;

      const response = await fetch('/api/working-hours/' + id, { method: 'DELETE' });
      if (!response.ok) {
        showNotice('Falha ao remover horario.', 'warn');
        return;
      }

      await loadCatalogs();
      showNotice('Horario removido.', 'ok');
    });

    reloadBtn.addEventListener('click', connectStream);
    dateInput.addEventListener('change', connectStream);

    dateInput.value = todayISO();
    loadCatalogs().then(connectStream);
  </script>
</body>
</html>`);
});

export default router;
