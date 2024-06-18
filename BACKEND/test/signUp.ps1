# S'inscrire (signUp)
function SignUp {
    param (
        [string]$username,
        [string]$password,
    )

    $body = @{
        username = $username
        password = $password
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:3000/signUp" -Method Post -Body $body -ContentType "application/json"
    Write-Output $response
}

# Exemple d'utilisation pour s'inscrire
SignUp -username "Alice" -password "password123"
