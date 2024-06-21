# Se connecter (signIn)
function SignIn {
    param (
        [string]$username,
        [string]$password
    )

    $body = @{
        username = $username
        password = $password
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://bakcend:3000/signIn" -Method Post -Body $body -ContentType "application/json"
    Write-Output $response
}

# Exemple d'utilisation pour se connecter
SignIn -username "Alice" -password "password123"
