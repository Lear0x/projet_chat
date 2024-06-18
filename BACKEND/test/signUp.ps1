# S'inscrire (signUp)
function SignUp {
    param (
        [string]$username,
        [string]$password,
        [string]$confirmPassword
    )

    $body = @{
        username = $username
        password = $password
        confirmPassword = $confirmPassword
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:3000/signUp" -Method Post -Body $body -ContentType "application/json"
    Write-Output $response
}

# Exemple d'utilisation pour s'inscrire
SignUp -username "Alice" -password "password123" -confirmPassword "password123"
