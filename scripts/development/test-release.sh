#!/bin/bash
# filepath: /Users/kylemendell/dev/svelocker-ui/scripts/development/test-release.sh

# Set dry run mode
DRY_RUN=true
echo "🧪 TEST MODE: No actual commits, tags, or releases will be created"
echo "----------------------------------------"

# Rest of script logic from create-release.sh with modifications
# Check if the script is being run from the root of the project
if [ ! -f .version ] || [ ! -f package.json ] || [ ! -f CHANGELOG.md ]; then
    echo "Error: This script must be run from the root of the project."
    exit 1
fi

# Read the current version from .version
VERSION=$(cat .version)
echo "Current version: $VERSION"

# Function to increment the version
increment_version() {
    local version=$1
    local part=$2

    IFS='.' read -r -a parts <<<"$version"
    if [ "$part" == "minor" ]; then
        parts[1]=$((parts[1] + 1))
        parts[2]=0
    elif [ "$part" == "patch" ]; then
        parts[2]=$((parts[2] + 1))
    fi
    echo "${parts[0]}.${parts[1]}.${parts[2]}"
}

RELEASE_TYPE=$1

if [ "$RELEASE_TYPE" == "minor" ]; then
    echo "Performing minor release..."
    NEW_VERSION=$(increment_version $VERSION minor)
elif [ "$RELEASE_TYPE" == "patch" ]; then
    echo "Performing patch release..."
    NEW_VERSION=$(increment_version $VERSION patch)
else
    echo "Invalid release type. Please enter either 'minor' or 'patch'."
    exit 1
fi

echo "New version would be: $NEW_VERSION"

# Skip confirmation in test mode
# Instead of modifying files, just show what would happen
echo "----------------------------------------"
echo "🔍 Would update .version file with: $NEW_VERSION"
echo "🔍 Would update package.json version to: $NEW_VERSION"

# Check if conventional-changelog is installed
if ! command -v conventional-changelog &>/dev/null; then
    echo "⚠️ conventional-changelog not found, would install it in actual run"
else
    echo "✅ conventional-changelog is installed"
fi

# Generate changelog to temporary file to preview it
echo "----------------------------------------"
echo "🔍 Testing changelog generation..."
TEMP_CHANGELOG=$(mktemp)
conventional-changelog -p conventionalcommits --commit-path . --lerna-package . -t "" --config ./changelog.config.cjs > $TEMP_CHANGELOG

if [ $? -eq 0 ]; then
    echo "✅ Changelog generation successful!"
    echo "----------------------------------------"
    echo "📋 Preview of changes that would be added to CHANGELOG.md:"
    cat $TEMP_CHANGELOG
    rm $TEMP_CHANGELOG
else
    echo "❌ Changelog generation failed"
    rm $TEMP_CHANGELOG
    exit 1
fi

echo "----------------------------------------"
echo "🔍 Would commit changes with message: \"release: $NEW_VERSION\""
echo "🔍 Would create Git tag: v$NEW_VERSION"
echo "🔍 Would push commit and tags to remote repository"

# Check if gh CLI is available
if ! command -v gh &>/dev/null; then
    echo "⚠️ GitHub CLI (gh) is not installed. Would be required for actual release."
else
    echo "✅ GitHub CLI is installed"
    # Extract what would be the changelog content
    echo "----------------------------------------"
    echo "🔍 Would create GitHub release with title: v$NEW_VERSION"
fi

echo "----------------------------------------"
echo "✅ Test completed successfully!"