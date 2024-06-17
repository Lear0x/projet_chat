# Rejoindre une salle de discussion
function JoinRoom {
    param (
        [string]$username,
        [string]$room
    )

    $body = @{
        username = $username
        room = $room
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:3000/join-room" -Method Post -Body $body -ContentType "application/json"
    Write-Output $response
}

# Exemple d'utilisation pour rejoindre une salle de discussion
JoinRoom -username "Alice" -room "public_room"
