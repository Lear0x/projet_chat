# Récupérer tous les utilisateurs dans une salle de discussion
function GetUsersInRoom {
    param (
        [string]$room
    )

    $response = Invoke-RestMethod -Uri "http://localhost:3000/users-in-room/$room" -Method Get
    Write-Output $response.users
}

# Exemple d'utilisation pour récupérer tous les utilisateurs dans une salle de discussion
GetUsersInRoom -room "public_room"
