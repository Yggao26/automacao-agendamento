# Script de simulação manual do fluxo de agendamento
# Execute com: .\scripts\simular-agendamento.ps1

$base = "http://localhost:3333"
$phone = "5511900000001"

Write-Host ""
Write-Host "=== Simulador do Barber-bot ===" -ForegroundColor Cyan
Write-Host "Servidor: $base"
Write-Host "Telefone ficticio: $phone"
Write-Host ""

function SendMsg([string]$text) {
    $body = @{
        entry = @(@{
            changes = @(@{
                value = @{
                    messages = @(@{
                        from = $phone
                        type = "text"
                        text = @{ body = $text }
                    })
                }
            })
        })
    } | ConvertTo-Json -Depth 10

    $res = Invoke-RestMethod -Method Post -Uri "$base/webhook" -ContentType "application/json" -Body $body
    Write-Host "  Bot respondeu (via WhatsApp real ou log do servidor)" -ForegroundColor Yellow
}

# Verifica servidor
try {
    $health = (Invoke-WebRequest -Uri "$base/" -UseBasicParsing -TimeoutSec 5).Content
    Write-Host "Servidor: $health" -ForegroundColor Green
} catch {
    Write-Host "ERRO: servidor nao responde em $base. Rode npm run dev primeiro." -ForegroundColor Red
    exit 1
}

# Garante dados minimos
try {
    $services = Invoke-RestMethod -Uri "$base/api/services"
    if ($services.Count -eq 0) {
        Invoke-RestMethod -Method Post -Uri "$base/api/services" -ContentType "application/json" -Body '{"name":"Corte","duration":40}' | Out-Null
        Write-Host "Servico criado: Corte 40 min" -ForegroundColor Green
    }

    $hours = Invoke-RestMethod -Uri "$base/api/working-hours"
    if ($hours.Count -eq 0) {
        Invoke-RestMethod -Method Post -Uri "$base/api/working-hours" -ContentType "application/json" -Body '{"weekday":4,"start":"09:00","end":"18:00"}' | Out-Null
        Write-Host "Horario criado: quinta 09:00-18:00" -ForegroundColor Green
    }
} catch {
    Write-Host "Aviso: nao foi possivel preparar dados base" -ForegroundColor Yellow
}

# Busca proxima data util (proxima quinta-feira)
$today = Get-Date
$daysUntilThursday = (4 - [int]$today.DayOfWeek + 7) % 7
if ($daysUntilThursday -eq 0) { $daysUntilThursday = 7 }
$nextThursday = $today.AddDays($daysUntilThursday).ToString("yyyy-MM-dd")

Write-Host ""
Write-Host "--- Iniciando simulacao do fluxo ---" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1] Cliente manda: Oi"
SendMsg "Oi"
Start-Sleep -Milliseconds 500

Write-Host "[2] Cliente manda: Joao da Silva"
SendMsg "Joao da Silva"
Start-Sleep -Milliseconds 500

Write-Host "[3] Cliente manda data: $nextThursday"
SendMsg $nextThursday
Start-Sleep -Milliseconds 500

# Busca primeiro slot disponivel
try {
    $services = Invoke-RestMethod -Uri "$base/api/services"
    $sid = $services[0].id
    $avail = Invoke-RestMethod -Uri "$base/api/availability?date=$nextThursday&serviceId=$sid"
    $slot = $avail.slots | Select-Object -First 1

    if ($slot) {
        Write-Host "[4] Cliente escolhe horario: $slot"
        SendMsg $slot
        Start-Sleep -Milliseconds 500

        Write-Host ""
        Write-Host "--- Resultado ---" -ForegroundColor Cyan
        $agenda = Invoke-RestMethod -Uri "$base/api/appointments?date=$nextThursday"
        Write-Host "Agendamentos em $nextThursday`: $($agenda.total)"
        $agenda.appointments | ForEach-Object {
            Write-Host "  $($_.start) - $($_.client.name) - $($_.service.name)" -ForegroundColor Green
        }
    } else {
        Write-Host "Nenhum slot disponivel para $nextThursday" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Erro ao buscar disponibilidade: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Simulacao concluida." -ForegroundColor Cyan
