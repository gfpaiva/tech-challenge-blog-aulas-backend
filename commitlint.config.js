module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            ['feat', 'fix', 'refactor', 'docs', 'chore', 'style', 'test'],
        ],
        'subject-case': [2, 'always', 'lower-case'],
        'subject-full-stop': [2, 'never', '.'],
        'type-case': [2, 'always', 'lower-case'],
        'type-empty': [2, 'never'],
        'subject-empty': [2, 'never'],
    },
};
