#!/usr/bin/env bash
set -e

echo "Staging all changes..."
git add .

echo "Committing..."
git commit -m "chore: update UI, add backend API, confirm & snackbar, deploy docs"

echo "Pushing to origin (current branch)..."
git push

echo "Done." 
