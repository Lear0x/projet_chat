# Envoyer un message à une salle de discussion
function SendMessageToRoom {
    param (
        [string]$username,
        [string]$message,
        [string]$room
    )

    $body = @{
        username = $username
        message = $message
        room = $room
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:3000/send-to-room" -Method Post -Body $body -ContentType "application/json"
    Write-Output $response
}

# Exemple d'utilisation pour envoyer un message à une salle de discussion
SendMessageToRoom -username "Alice" -message "Hello, Public Room!" -room "public_room"
