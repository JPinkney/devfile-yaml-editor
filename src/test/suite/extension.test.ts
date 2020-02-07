import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { generatePlugins, generateProjects } from '../../devfile-generation';
// import * as myExtension from '../extension';

suite('Extension Test Suite', () => {
	test('Sample test', () => {
		generatePlugins();
	});
	test('Sample test', () => {
		generateProjects();
	});
});
