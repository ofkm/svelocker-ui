#!/bin/bash
# Test script for create-release.sh
# This script simulates the release process without making actual changes

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Mock functions
mock_git() {
    echo "[MOCK GIT] Would execute: git $*"
    
    # Mock git describe to return a fake tag
    if [[ "$1" == "describe" ]]; then
        echo "v1.0.0"
        return 0
    fi
    
    # Mock git log to simulate commit messages
    if [[ "$1" == "log" ]]; then
        if [[ "$*" == *"grep -q \"feat\""* ]]; then
            # Simulating a feature commit for testing minor release
            return 0
        elif [[ "$*" == *"grep -q \"fix\""* ]]; then
            # Simulating a fix commit for testing patch release
            return 0
        fi
    fi
    
    return 0
}

mock_file_write() {
    echo "[MOCK FILE] Would write '$2' to file: $1"
}

mock_jq() {
    echo "[MOCK JQ] Would update package.json version to $NEW_VERSION"
}

mock_conventional_changelog() {
    echo "[MOCK CHANGELOG] Would generate changelog entries in CHANGELOG.md"
}

mock_gh_release() {
    echo "[MOCK GITHUB] Would create GitHub release v$1 with notes:"
    echo "$2"
}

mock_read() {
    echo "[MOCK PROMPT] User would be asked: $*"
    echo "[MOCK PROMPT] Automatically responding: y"
    CONFIRM="y"
}

test_increment_version() {
    local version=$1
    local part=$2

    IFS='.' read -r -a parts <<<"$version"
    if [ "$part" == "major" ]; then
        parts[0]=$((parts[0] + 1))
        parts[1]=0
        parts[2]=0
    elif [ "$part" == "minor" ]; then
        parts[1]=$((parts[1] + 1))
        parts[2]=0
    elif [ "$part" == "patch" ]; then
        parts[2]=$((parts[2] + 1))
    fi
    echo "${parts[0]}.${parts[1]}.${parts[2]}"
}

extract_real_changelog() {
    # Check if the CHANGELOG.md file exists
    if [ -f CHANGELOG.md ]; then
        echo "[REAL] Using actual CHANGELOG.md from repository"
        # Extract the most recent changelog entry as a sample
        local content
        content=$(awk '/^## / {if (++count == 2) exit; if (count == 1) print $0} count == 1 {print}' CHANGELOG.md)
        
        if [ -z "$content" ]; then
            echo "[WARNING] Could not extract content from actual CHANGELOG.md"
            echo "This is where the actual changelog would appear based on your commit history"
            echo "Format would follow conventional commits standard with sections like:"
            echo "- Features"
            echo "- Bug Fixes"
            echo "- Performance Improvements"
            echo "- BREAKING CHANGES (for major releases)"
        else
            echo "$content"
        fi
    else
        echo "[WARNING] CHANGELOG.md not found in current directory"
        echo "This is where the actual changelog would appear based on your commit history"
        echo "Format would follow conventional commits standard with sections like:"
        echo "- Features"
        echo "- Bug Fixes"
        echo "- Performance Improvements"
        echo "- BREAKING CHANGES (for major releases)"
    fi
}

# Mock the release process
test_release_process() {
    local release_type=$1
    
    echo -e "\n${GREEN}=== Testing Create Release Script (${release_type}) ===${NC}\n"
    
    # Check if we can read the current version
    if [ -f .version ]; then
        VERSION=$(cat .version)
        echo "[REAL] Current version from .version file: $VERSION"
    else
        VERSION="1.2.3"
        echo "[MOCK] Current version (default): $VERSION"
    fi
    
    # Determine release type
    if [ "$release_type" == "major" ]; then
        RELEASE_TYPE="major"
        echo "[MOCK] Explicitly requested major release"
    else
        echo "[MOCK] Checking latest tag..."
        LATEST_TAG=$(mock_git describe --tags --abbrev=0)
        echo "[MOCK] Latest tag: $LATEST_TAG"
        
        echo "[MOCK] Checking commit history for release type determination..."
        if [ "$release_type" == "minor" ]; then
            echo "[MOCK] Found 'feat' commit in history"
            RELEASE_TYPE="minor"
        elif [ "$release_type" == "patch" ]; then
            echo "[MOCK] Found 'fix' commit in history"
            RELEASE_TYPE="patch"
        else
            echo "[MOCK] No 'fix' or 'feat' commits found. No release will be created."
            return 0
        fi
    fi
    
    # Increment the version based on the release type
    echo -e "\n${YELLOW}Determining new version:${NC}"
    if [ "$RELEASE_TYPE" == "major" ]; then
        echo "[MOCK] Performing major release..."
        NEW_VERSION=$(test_increment_version $VERSION major)
    elif [ "$RELEASE_TYPE" == "minor" ]; then
        echo "[MOCK] Performing minor release..."
        NEW_VERSION=$(test_increment_version $VERSION minor)
    elif [ "$RELEASE_TYPE" == "patch" ]; then
        echo "[MOCK] Performing patch release..."
        NEW_VERSION=$(test_increment_version $VERSION patch)
    fi
    
    echo "[MOCK] New version will be: $NEW_VERSION"
    
    # Confirm release creation
    mock_read "This will create a new $RELEASE_TYPE release with version $NEW_VERSION. Do you want to proceed? (y/n) "
    
    echo -e "\n${YELLOW}File changes that would occur:${NC}"
    # Update the .version file with the new version
    mock_file_write ".version" "$NEW_VERSION"
    echo "[MOCK] Would add .version to git"
    
    # Update version in package.json
    mock_jq
    echo "[MOCK] Would add package.json to git"
    
    # Generate changelog
    echo "[MOCK] Checking for conventional-changelog..."
    if command -v conventional-changelog &>/dev/null; then
        echo "[REAL] conventional-changelog is installed"
    else
        echo "[MOCK] Found conventional-changelog (simulated)"
    fi
    mock_conventional_changelog
    echo "[MOCK] Would add CHANGELOG.md to git"
    
    echo -e "\n${YELLOW}Git operations that would occur:${NC}"
    # Commit the changes with the new version
    mock_git commit -m "release: $NEW_VERSION"
    
    # Create a Git tag with the new version
    mock_git tag "v$NEW_VERSION"
    
    # Push the commit and the tag to the repository
    mock_git push
    mock_git push --tags
    
    echo -e "\n${YELLOW}GitHub release that would be created:${NC}"
    # Check if GitHub CLI is installed
    if command -v gh &>/dev/null; then
        echo "[REAL] GitHub CLI is installed"
    else
        echo "[MOCK] GitHub CLI is installed (simulated)"
    fi
    
    # Extract the changelog content for the latest release
    echo "[MOCK] Extracting changelog content for version $NEW_VERSION..."
    CHANGELOG=$(extract_real_changelog)
    
    # Create the release on GitHub
    mock_gh_release "$NEW_VERSION" "$CHANGELOG"
    
    echo -e "\n${GREEN}=== Test Release Process Complete ===${NC}"
    echo "[MOCK] New version would be: $NEW_VERSION"
}

# Main execution
if [ "$1" == "--help" ]; then
    echo "Usage: ./test_create-release.sh [release-type]"
    echo "  release-type: major, minor, patch, none (default: minor)"
    echo "This script tests the create-release.sh functionality without making actual changes"
    exit 0
fi

# Default to minor release if not specified
RELEASE_TYPE="${1:-minor}"

test_release_process "$RELEASE_TYPE"

echo -e "\n${YELLOW}Note: This was just a test run. No actual changes were made.${NC}"
echo "To perform an actual release, run: ./create-release.sh [major|minor|patch]"