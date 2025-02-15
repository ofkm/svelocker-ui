# Check if the script is being run from the root of the project
if (!(Test-Path .version) -or !(Test-Path package.json) -or !(Test-Path CHANGELOG.md)) {
    Write-Host "Error: This script must be run from the root of the project."
    exit 1
}

# Read the current version from .version
$VERSION = Get-Content .version

# Function to increment the version
function Increment-Version {
    param (
        [string]$version,
        [string]$part
    )

    $parts = $version -split '\.'
    if ($part -eq "minor") {
        $parts[1] = [int]$parts[1] + 1
        $parts[2] = 0
    } elseif ($part -eq "patch") {
        $parts[2] = [int]$parts[2] + 1
    }
    return "$($parts[0]).$($parts[1]).$($parts[2])"
}

$RELEASE_TYPE = $args[0]

if ($RELEASE_TYPE -eq "minor") {
    Write-Host "Performing minor release..."
    $NEW_VERSION = Increment-Version $VERSION minor
} elseif ($RELEASE_TYPE -eq "patch") {
    Write-Host "Performing patch release..."
    $NEW_VERSION = Increment-Version $VERSION patch
} else {
    Write-Host "Invalid release type. Please enter either 'minor' or 'patch'."
    exit 1
}

# Confirm release creation
$CONFIRM = Read-Host "This will create a new $RELEASE_TYPE release with version $NEW_VERSION. Do you want to proceed? (y/n)"
if ($CONFIRM -ne "y") {
    Write-Host "Release process canceled."
    exit 1
}

# Update the .version file with the new version
$NEW_VERSION | Set-Content .version

# Update version in package.json
(Get-Content package.json) | ConvertFrom-Json | ForEach-Object {
    $_.version = $NEW_VERSION
    $_ | ConvertTo-Json -Depth 10
} | Set-Content package.json

# Commit changes
git add .version package.json

# Check if conventional-changelog is installed
if (-not (Get-Command conventional-changelog -ErrorAction SilentlyContinue)) {
    Write-Host "conventional-changelog not found, installing..."
    npm install -g conventional-changelog-cli
}

# Generate changelog
Write-Host "Generating changelog..."
conventional-changelog -p conventionalcommits -i CHANGELOG.md -s

git add CHANGELOG.md

git commit -m "release: $NEW_VERSION"
git tag "v$NEW_VERSION"

git push
git push --tags

# Check if GitHub CLI is installed
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "GitHub CLI (gh) is not installed. Please install it and authenticate using 'gh auth login'."
    exit 1
}

# Extract the changelog content for the latest release
# $CHANGELOG = Select-String -Path CHANGELOG.md -Pattern "^## " -Context 0,100 | ForEach-Object { $_.Context.PostContext } | Out-String
# Write the changelog to notes.txt
# $CHANGELOG | Set-Content notes.txt

# Extract the changelog content for the latest release
$CHANGELOG = Get-Content CHANGELOG.md

# Find all version headers
$versionHeaders = $CHANGELOG | Where-Object { $_ -match "^## \[" }

# Check if any headers were found
if ($versionHeaders.Count -gt 0) {
    # Get the index of the latest version header
    $latestHeaderIndex = $CHANGELOG.IndexOf($versionHeaders[0])
    Write-Host "Latest header found at index: $latestHeaderIndex"

    # Find the next header after the latest
    $nextHeaderIndex = -1
    if ($versionHeaders.Count -gt 1) {
        $nextHeaderIndex = $CHANGELOG.IndexOf($versionHeaders[1]) # This will be -1 if there is no next header
    }
    Write-Host "Next header found at index: $nextHeaderIndex"

    # If no next header is found, extract until the end of the file
    if ($nextHeaderIndex -eq -1) {
        $latestReleaseNotes = $CHANGELOG[$latestHeaderIndex..($CHANGELOG.Count - 1)]
    } else {
        # Extract lines between the latest version header and the next header
        $latestReleaseNotes = $CHANGELOG[$latestHeaderIndex..($nextHeaderIndex - 1)]
    }

    # Convert the array of lines back to a single string
    $CHANGELOG = $latestReleaseNotes -join "`n"

    # Debug output to check what is being written
    # Write-Host "Extracted changelog content:"
    # Write-Host $CHANGELOG

    # Write the changelog to notes.txt
    $CHANGELOG | Set-Content notes.txt

    if ([string]::IsNullOrWhiteSpace($CHANGELOG)) {
        Write-Host "Error: Could not extract changelog for version $NEW_VERSION."
        exit 1
    } else {
        Write-Host "Changelog written to notes.txt successfully."
    }
} else {
    Write-Host "Error: No version headers found in CHANGELOG.md."
    exit 1
}


if ([string]::IsNullOrWhiteSpace($CHANGELOG)) {
    Write-Host "Error: Could not extract changelog for version $NEW_VERSION."
    exit 1
}

# Create the release on GitHub
Write-Host "Creating GitHub release..."
gh release create "v$NEW_VERSION" --title "v$NEW_VERSION" --notes-file .\notes.txt

if ($?) {
    Write-Host "GitHub release created successfully."
} else {
    Write-Host "Error: Failed to create GitHub release."
    exit 1
}

Write-Host "Release process complete. New version: $NEW_VERSION"
