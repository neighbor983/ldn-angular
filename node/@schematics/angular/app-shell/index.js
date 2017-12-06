"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
require("rxjs/add/operator/merge");
const ts = require("typescript");
const ast_utils_1 = require("../utility/ast-utils");
const config_1 = require("../utility/config");
const ng_ast_utils_1 = require("../utility/ng-ast-utils");
const route_utils_1 = require("../utility/route-utils");
// Helper functions. (possible refactors to utils)
function formatMissingAppMsg(label, nameOrIndex) {
    const nameOrIndexText = nameOrIndex ? ` (${nameOrIndex})` : '';
    return `${label} app ${nameOrIndexText} not found.`;
}
function getSourceFile(host, path) {
    const buffer = host.read(path);
    if (!buffer) {
        throw new schematics_1.SchematicsException(`Could not find bootstrapped module.`);
    }
    const content = buffer.toString();
    const source = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
    return source;
}
function getServerModulePath(host, app) {
    const mainPath = `/${app.root}/${app.main}`;
    const mainSource = getSourceFile(host, mainPath);
    const allNodes = ast_utils_1.getSourceNodes(mainSource);
    const expNode = allNodes.filter(node => node.kind === ts.SyntaxKind.ExportDeclaration)[0];
    if (!expNode) {
        return null;
    }
    const relativePath = expNode.moduleSpecifier;
    const modulePath = core_1.normalize(`/${app.root}/${relativePath.text}.ts`);
    return modulePath;
}
function getComponentTemplateInfo(host, componentPath) {
    const compSource = getSourceFile(host, componentPath);
    const compMetadata = ast_utils_1.getDecoratorMetadata(compSource, 'Component', '@angular/core')[0];
    return {
        templateProp: getMetadataProperty(compMetadata, 'template'),
        templateUrlProp: getMetadataProperty(compMetadata, 'templateUrl'),
    };
}
function getComponentTemplate(host, compPath, tmplInfo) {
    let template = '';
    if (tmplInfo.templateProp) {
        template = tmplInfo.templateProp.getFullText();
    }
    else if (tmplInfo.templateUrlProp) {
        const templateUrl = tmplInfo.templateUrlProp.initializer.text;
        const dirEntry = host.getDir(compPath);
        const dir = dirEntry.parent ? dirEntry.parent.path : '/';
        const templatePath = core_1.normalize(`/${dir}/${templateUrl}`);
        const buffer = host.read(templatePath);
        if (buffer) {
            template = buffer.toString();
        }
    }
    return template;
}
function getBootstrapComponentPath(host, appConfig) {
    const modulePath = ng_ast_utils_1.getAppModulePath(host, appConfig);
    const moduleSource = getSourceFile(host, modulePath);
    const metadataNode = ast_utils_1.getDecoratorMetadata(moduleSource, 'NgModule', '@angular/core')[0];
    const bootstrapProperty = getMetadataProperty(metadataNode, 'bootstrap');
    const arrLiteral = bootstrapProperty
        .initializer;
    const componentSymbol = arrLiteral.elements[0].getText();
    const relativePath = ast_utils_1.getSourceNodes(moduleSource)
        .filter(node => node.kind === ts.SyntaxKind.ImportDeclaration)
        .filter(imp => {
        return ast_utils_1.findNode(imp, ts.SyntaxKind.Identifier, componentSymbol);
    })
        .map((imp) => {
        const pathStringLiteral = imp.moduleSpecifier;
        return pathStringLiteral.text;
    })[0];
    const dirEntry = host.getDir(modulePath);
    const dir = dirEntry.parent ? dirEntry.parent.path : '/';
    const compPath = core_1.normalize(`/${dir}/${relativePath}.ts`);
    return compPath;
}
// end helper functions.
function validateProject(options) {
    return (host, context) => {
        const routerOutletCheckRegex = /<router\-outlet.*?>([\s\S]*?)<\/router\-outlet>/;
        const config = config_1.getConfig(host);
        const app = config_1.getAppFromConfig(config, options.clientApp || '0');
        if (app === null) {
            throw new schematics_1.SchematicsException(formatMissingAppMsg('Client', options.clientApp));
        }
        const componentPath = getBootstrapComponentPath(host, app);
        const tmpl = getComponentTemplateInfo(host, componentPath);
        const template = getComponentTemplate(host, componentPath, tmpl);
        if (!routerOutletCheckRegex.test(template)) {
            const errorMsg = `Prerequisite for app shell is to define a router-outlet in your root component.`;
            context.logger.error(errorMsg);
            throw new schematics_1.SchematicsException(errorMsg);
        }
    };
}
function addUniversalApp(options) {
    return (host, context) => {
        const config = config_1.getConfig(host);
        const appConfig = config_1.getAppFromConfig(config, options.universalApp);
        if (appConfig && appConfig.platform === 'server') {
            return host;
        }
        else if (appConfig && appConfig.platform !== 'server') {
            throw new schematics_1.SchematicsException(`Invalid platform for universal app (${options.universalApp}), value must be "server".`);
        }
        // Copy options.
        const universalOptions = Object.assign({}, options, { name: options.universalApp });
        // Delete non-universal options.
        delete universalOptions.universalApp;
        delete universalOptions.route;
        return schematics_1.schematic('universal', universalOptions)(host, context);
    };
}
function addAppShellConfig(options) {
    return (host) => {
        const config = config_1.getConfig(host);
        const app = config_1.getAppFromConfig(config, options.clientApp || '0');
        if (!app) {
            throw new schematics_1.SchematicsException(formatMissingAppMsg('Client', options.clientApp));
        }
        if (!options.route) {
            throw new schematics_1.SchematicsException(`Route is not defined`);
        }
        app.appShell = {
            app: options.universalApp,
            route: options.route,
        };
        host.overwrite('/.angular-cli.json', JSON.stringify(config, null, 2));
        return host;
    };
}
function addRouterModule(options) {
    return (host) => {
        const config = config_1.getConfig(host);
        const app = config_1.getAppFromConfig(config, options.clientApp || '0');
        if (app === null) {
            throw new schematics_1.SchematicsException(formatMissingAppMsg('Client', options.clientApp));
        }
        const modulePath = ng_ast_utils_1.getAppModulePath(host, app);
        const moduleSource = getSourceFile(host, modulePath);
        const changes = ast_utils_1.addImportToModule(moduleSource, modulePath, 'RouterModule', '@angular/router');
        const recorder = host.beginUpdate(modulePath);
        changes.forEach((change) => {
            recorder.insertLeft(change.pos, change.toAdd);
        });
        host.commitUpdate(recorder);
        return host;
    };
}
function getMetadataProperty(metadata, propertyName) {
    const properties = metadata.properties;
    const property = properties
        .filter(prop => prop.kind === ts.SyntaxKind.PropertyAssignment)
        .filter((prop) => {
        const name = prop.name;
        switch (name.kind) {
            case ts.SyntaxKind.Identifier:
                return name.getText() === propertyName;
            case ts.SyntaxKind.StringLiteral:
                return name.text === propertyName;
        }
        return false;
    })[0];
    return property;
}
function addServerRoutes(options) {
    return (host) => {
        const config = config_1.getConfig(host);
        const app = config_1.getAppFromConfig(config, options.universalApp);
        if (app === null) {
            throw new schematics_1.SchematicsException(formatMissingAppMsg('Universal/server', options.universalApp));
        }
        const modulePath = getServerModulePath(host, app);
        if (modulePath === null) {
            throw new schematics_1.SchematicsException('Universal/server module not found.');
        }
        let moduleSource = getSourceFile(host, modulePath);
        if (!ast_utils_1.isImported(moduleSource, 'Routes', '@angular/router')) {
            const recorder = host.beginUpdate(modulePath);
            const routesChange = route_utils_1.insertImport(moduleSource, modulePath, 'Routes', '@angular/router');
            if (routesChange.toAdd) {
                recorder.insertLeft(routesChange.pos, routesChange.toAdd);
            }
            const imports = ast_utils_1.getSourceNodes(moduleSource)
                .filter(node => node.kind === ts.SyntaxKind.ImportDeclaration)
                .sort((a, b) => a.getStart() - b.getStart());
            const insertPosition = imports[imports.length - 1].getEnd();
            const routeText = `\n\nconst routes: Routes = [ { path: '${options.route}', component: AppShellComponent }];`;
            recorder.insertRight(insertPosition, routeText);
            host.commitUpdate(recorder);
        }
        moduleSource = getSourceFile(host, modulePath);
        if (!ast_utils_1.isImported(moduleSource, 'RouterModule', '@angular/router')) {
            const recorder = host.beginUpdate(modulePath);
            const routerModuleChange = route_utils_1.insertImport(moduleSource, modulePath, 'RouterModule', '@angular/router');
            if (routerModuleChange.toAdd) {
                recorder.insertLeft(routerModuleChange.pos, routerModuleChange.toAdd);
            }
            const metadataChange = ast_utils_1.addSymbolToNgModuleMetadata(moduleSource, modulePath, 'imports', 'RouterModule.forRoot(routes)');
            if (metadataChange) {
                metadataChange.forEach((change) => {
                    recorder.insertRight(change.pos, change.toAdd);
                });
            }
            host.commitUpdate(recorder);
        }
        return host;
    };
}
function addShellComponent(options) {
    return (host, context) => {
        const componentOptions = {
            name: 'app-shell',
            module: options.rootModuleFileName,
        };
        return schematics_1.schematic('component', componentOptions)(host, context);
    };
}
function default_1(options) {
    return schematics_1.chain([
        validateProject(options),
        addUniversalApp(options),
        addAppShellConfig(options),
        addRouterModule(options),
        addServerRoutes(options),
        addShellComponent(options),
    ]);
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2hhbnNsL1NvdXJjZXMvaGFuc2wvZGV2a2l0LyIsInNvdXJjZXMiOlsicGFja2FnZXMvc2NoZW1hdGljcy9hbmd1bGFyL2FwcC1zaGVsbC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILCtDQUFpRDtBQUNqRCwyREFPb0M7QUFDcEMsbUNBQWlDO0FBQ2pDLGlDQUFpQztBQUNqQyxvREFPOEI7QUFFOUIsOENBQTJFO0FBQzNFLDBEQUEyRDtBQUMzRCx3REFBc0Q7QUFJdEQsa0RBQWtEO0FBQ2xELDZCQUE2QixLQUFhLEVBQUUsV0FBK0I7SUFDekUsTUFBTSxlQUFlLEdBQUcsV0FBVyxHQUFHLEtBQUssV0FBVyxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBRS9ELE1BQU0sQ0FBQyxHQUFHLEtBQUssUUFBUSxlQUFlLGFBQWEsQ0FBQztBQUN0RCxDQUFDO0FBRUQsdUJBQXVCLElBQVUsRUFBRSxJQUFZO0lBQzdDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ1osTUFBTSxJQUFJLGdDQUFtQixDQUFDLHFDQUFxQyxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUNELE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNsQyxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUVoRixNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFFRCw2QkFBNkIsSUFBVSxFQUFFLEdBQWM7SUFDckQsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FB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Q0FBQztJQUNkLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRCwyQkFBMkIsT0FBd0I7SUFDakQsTUFBTSxDQUFDLENBQUMsSUFBVSxFQUFFLE9BQXlCO1FBRTNDLE1BQU0sZ0JBQWdCLEdBQUc7WUFDdkIsSUFBSSxFQUFFLFdBQVc7WUFDakIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxrQkFBa0I7U0FDbkMsQ0FBQztRQUVGLE1BQU0sQ0FBQyxzQkFBUyxDQUFDLFdBQVcsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNqRSxDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQsbUJBQXlCLE9BQXdCO0lBQy9DLE1BQU0sQ0FBQyxrQkFBSyxDQUFDO1FBQ1gsZUFBZSxDQUFDLE9BQU8sQ0FBQztRQUN4QixlQUFlLENBQUMsT0FBTyxDQUFDO1FBQ3hCLGlCQUFpQixDQUFDLE9BQU8sQ0FBQztRQUMxQixlQUFlLENBQUMsT0FBTyxDQUFDO1FBQ3hCLGVBQWUsQ0FBQyxPQUFPLENBQUM7UUFDeEIsaUJBQWlCLENBQUMsT0FBTyxDQUFDO0tBQzNCLENBQUMsQ0FBQztBQUNMLENBQUM7QUFURCw0QkFTQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IG5vcm1hbGl6ZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7XG4gIFJ1bGUsXG4gIFNjaGVtYXRpY0NvbnRleHQsXG4gIFNjaGVtYXRpY3NFeGNlcHRpb24sXG4gIFRyZWUsXG4gIGNoYWluLFxuICBzY2hlbWF0aWMsXG59IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcbmltcG9ydCAncnhqcy9hZGQvb3BlcmF0b3IvbWVyZ2UnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQge1xuICBhZGRJbXBvcnRUb01vZHVsZSxcbiAgYWRkU3ltYm9sVG9OZ01vZHVsZU1ldGFkYXRhLFxuICBmaW5kTm9kZSxcbiAgZ2V0RGVjb3JhdG9yTWV0YWRhdGEsXG4gIGdldFNvdXJjZU5vZGVzLFxuICBpc0ltcG9ydGVkLFxufSBmcm9tICcuLi91dGlsaXR5L2FzdC11dGlscyc7XG5pbXBvcnQgeyBJbnNlcnRDaGFuZ2UgfSBmcm9tICcuLi91dGlsaXR5L2NoYW5nZSc7XG5pbXBvcnQgeyBBcHBDb25maWcsIGdldEFwcEZyb21Db25maWcsIGdldENvbmZpZyB9IGZyb20gJy4uL3V0aWxpdHkvY29uZmlnJztcbmltcG9ydCB7IGdldEFwcE1vZHVsZVBhdGggfSBmcm9tICcuLi91dGlsaXR5L25nLWFzdC11dGlscyc7XG5pbXBvcnQgeyBpbnNlcnRJbXBvcnQgfSBmcm9tICcuLi91dGlsaXR5L3JvdXRlLXV0aWxzJztcbmltcG9ydCB7IFNjaGVtYSBhcyBBcHBTaGVsbE9wdGlvbnMgfSBmcm9tICcuL3NjaGVtYSc7XG5cblxuLy8gSGVscGVyIGZ1bmN0aW9ucy4gKHBvc3NpYmxlIHJlZmFjdG9ycyB0byB1dGlscylcbmZ1bmN0aW9uIGZvcm1hdE1pc3NpbmdBcHBNc2cobGFiZWw6IHN0cmluZywgbmFtZU9ySW5kZXg6IHN0cmluZyB8IHVuZGVmaW5lZCk6IHN0cmluZyB7XG4gIGNvbnN0IG5hbWVPckluZGV4VGV4dCA9IG5hbWVPckluZGV4ID8gYCAoJHtuYW1lT3JJbmRleH0pYCA6ICcnO1xuXG4gIHJldHVybiBgJHtsYWJlbH0gYXBwICR7bmFtZU9ySW5kZXhUZXh0fSBub3QgZm91bmQuYDtcbn1cblxuZnVuY3Rpb24gZ2V0U291cmNlRmlsZShob3N0OiBUcmVlLCBwYXRoOiBzdHJpbmcpOiB0cy5Tb3VyY2VGaWxlIHtcbiAgY29uc3QgYnVmZmVyID0gaG9zdC5yZWFkKHBhdGgpO1xuICBpZiAoIWJ1ZmZlcikge1xuICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKGBDb3VsZCBub3QgZmluZCBib290c3RyYXBwZWQgbW9kdWxlLmApO1xuICB9XG4gIGNvbnN0IGNvbnRlbnQgPSBidWZmZXIudG9TdHJpbmcoKTtcbiAgY29uc3Qgc291cmNlID0gdHMuY3JlYXRlU291cmNlRmlsZShwYXRoLCBjb250ZW50LCB0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0LCB0cnVlKTtcblxuICByZXR1cm4gc291cmNlO1xufVxuXG5mdW5jdGlvbiBnZXRTZXJ2ZXJNb2R1bGVQYXRoKGhvc3Q6IFRyZWUsIGFwcDogQXBwQ29uZmlnKTogc3RyaW5nIHwgbnVsbCB7XG4gIGNvbnN0IG1haW5QYXRoID0gYC8ke2FwcC5yb290fS8ke2FwcC5tYWlufWA7XG4gIGNvbnN0IG1haW5Tb3VyY2UgPSBnZXRTb3VyY2VGaWxlKGhvc3QsIG1haW5QYXRoKTtcbiAgY29uc3QgYWxsTm9kZXMgPSBnZXRTb3VyY2VOb2RlcyhtYWluU291cmNlKTtcbiAgY29uc3QgZXhwTm9kZSA9IGFsbE5vZGVzLmZpbHRlcihub2RlID0+IG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5FeHBvcnREZWNsYXJhdGlvbilbMF07XG4gIGlmICghZXhwTm9kZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IHJlbGF0aXZlUGF0aCA9IDx0cy5TdHJpbmdMaXRlcmFsPiAoPHRzLkV4cG9ydERlY2xhcmF0aW9uPiBleHBOb2RlKS5tb2R1bGVTcGVjaWZpZXI7XG4gIGNvbnN0IG1vZHVsZVBhdGggPSBub3JtYWxpemUoYC8ke2FwcC5yb290fS8ke3JlbGF0aXZlUGF0aC50ZXh0fS50c2ApO1xuXG4gIHJldHVybiBtb2R1bGVQYXRoO1xufVxuXG5pbnRlcmZhY2UgVGVtcGxhdGVJbmZvIHtcbiAgdGVtcGxhdGVQcm9wPzogdHMuUHJvcGVydHlBc3NpZ25tZW50O1xuICB0ZW1wbGF0ZVVybFByb3A/OiB0cy5Qcm9wZXJ0eUFzc2lnbm1lbnQ7XG59XG5cbmZ1bmN0aW9uIGdldENvbXBvbmVudFRlbXBsYXRlSW5mbyhob3N0OiBUcmVlLCBjb21wb25lbnRQYXRoOiBzdHJpbmcpOiBUZW1wbGF0ZUluZm8ge1xuICBjb25zdCBjb21wU291cmNlID0gZ2V0U291cmNlRmlsZShob3N0LCBjb21wb25lbnRQYXRoKTtcbiAgY29uc3QgY29tcE1ldGFkYXRhID0gZ2V0RGVjb3JhdG9yTWV0YWRhdGEoY29tcFNvdXJjZSwgJ0NvbXBvbmVudCcsICdAYW5ndWxhci9jb3JlJylbMF07XG5cbiAgcmV0dXJuIHtcbiAgICB0ZW1wbGF0ZVByb3A6IGdldE1ldGFkYXRhUHJvcGVydHkoY29tcE1ldGFkYXRhLCAndGVtcGxhdGUnKSxcbiAgICB0ZW1wbGF0ZVVybFByb3A6IGdldE1ldGFkYXRhUHJvcGVydHkoY29tcE1ldGFkYXRhLCAndGVtcGxhdGVVcmwnKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0Q29tcG9uZW50VGVtcGxhdGUoaG9zdDogVHJlZSwgY29tcFBhdGg6IHN0cmluZywgdG1wbEluZm86IFRlbXBsYXRlSW5mbyk6IHN0cmluZyB7XG4gIGxldCB0ZW1wbGF0ZSA9ICcnO1xuXG4gIGlmICh0bXBsSW5mby50ZW1wbGF0ZVByb3ApIHtcbiAgICB0ZW1wbGF0ZSA9IHRtcGxJbmZvLnRlbXBsYXRlUHJvcC5nZXRGdWxsVGV4dCgpO1xuICB9IGVsc2UgaWYgKHRtcGxJbmZvLnRlbXBsYXRlVXJsUHJvcCkge1xuICAgIGNvbnN0IHRlbXBsYXRlVXJsID0gKHRtcGxJbmZvLnRlbXBsYXRlVXJsUHJvcC5pbml0aWFsaXplciBhcyB0cy5TdHJpbmdMaXRlcmFsKS50ZXh0O1xuICAgIGNvbnN0IGRpckVudHJ5ID0gaG9zdC5nZXREaXIoY29tcFBhdGgpO1xuICAgIGNvbnN0IGRpciA9IGRpckVudHJ5LnBhcmVudCA/IGRpckVudHJ5LnBhcmVudC5wYXRoIDogJy8nO1xuICAgIGNvbnN0IHRlbXBsYXRlUGF0aCA9IG5vcm1hbGl6ZShgLyR7ZGlyfS8ke3RlbXBsYXRlVXJsfWApO1xuICAgIGNvbnN0IGJ1ZmZlciA9IGhvc3QucmVhZCh0ZW1wbGF0ZVBhdGgpO1xuICAgIGlmIChidWZmZXIpIHtcbiAgICAgIHRlbXBsYXRlID0gYnVmZmVyLnRvU3RyaW5nKCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRlbXBsYXRlO1xufVxuXG5mdW5jdGlvbiBnZXRCb290c3RyYXBDb21wb25lbnRQYXRoKGhvc3Q6IFRyZWUsIGFwcENvbmZpZzogQXBwQ29uZmlnKTogc3RyaW5nIHtcbiAgY29uc3QgbW9kdWxlUGF0aCA9IGdldEFwcE1vZHVsZVBhdGgoaG9zdCwgYXBwQ29uZmlnKTtcbiAgY29uc3QgbW9kdWxlU291cmNlID0gZ2V0U291cmNlRmlsZShob3N0LCBtb2R1bGVQYXRoKTtcblxuICBjb25zdCBtZXRhZGF0YU5vZGUgPSBnZXREZWNvcmF0b3JNZXRhZGF0YShtb2R1bGVTb3VyY2UsICdOZ01vZHVsZScsICdAYW5ndWxhci9jb3JlJylbMF07XG4gIGNvbnN0IGJvb3RzdHJhcFByb3BlcnR5ID0gZ2V0TWV0YWRhdGFQcm9wZXJ0eShtZXRhZGF0YU5vZGUsICdib290c3RyYXAnKTtcblxuICBjb25zdCBhcnJMaXRlcmFsID0gKDx0cy5Qcm9wZXJ0eUFzc2lnbm1lbnQ+IGJvb3RzdHJhcFByb3BlcnR5KVxuICAgIC5pbml0aWFsaXplciBhcyB0cy5BcnJheUxpdGVyYWxFeHByZXNzaW9uO1xuXG4gIGNvbnN0IGNvbXBvbmVudFN5bWJvbCA9IGFyckxpdGVyYWwuZWxlbWVudHNbMF0uZ2V0VGV4dCgpO1xuXG4gIGNvbnN0IHJlbGF0aXZlUGF0aCA9IGdldFNvdXJjZU5vZGVzKG1vZHVsZVNvdXJjZSlcbiAgICAuZmlsdGVyKG5vZGUgPT4gbm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkltcG9ydERlY2xhcmF0aW9uKVxuICAgIC5maWx0ZXIoaW1wID0+IHtcbiAgICAgIHJldHVybiBmaW5kTm9kZShpbXAsIHRzLlN5bnRheEtpbmQuSWRlbnRpZmllciwgY29tcG9uZW50U3ltYm9sKTtcbiAgICB9KVxuICAgIC5tYXAoKGltcDogdHMuSW1wb3J0RGVjbGFyYXRpb24pID0+IHtcbiAgICAgIGNvbnN0IHBhdGhTdHJpbmdMaXRlcmFsID0gPHRzLlN0cmluZ0xpdGVyYWw+IGltcC5tb2R1bGVTcGVjaWZpZXI7XG5cbiAgICAgIHJldHVybiBwYXRoU3RyaW5nTGl0ZXJhbC50ZXh0O1xuICAgIH0pWzBdO1xuXG4gIGNvbnN0IGRpckVudHJ5ID0gaG9zdC5nZXREaXIobW9kdWxlUGF0aCk7XG4gIGNvbnN0IGRpciA9IGRpckVudHJ5LnBhcmVudCA/IGRpckVudHJ5LnBhcmVudC5wYXRoIDogJy8nO1xuICBjb25zdCBjb21wUGF0aCA9IG5vcm1hbGl6ZShgLyR7ZGlyfS8ke3JlbGF0aXZlUGF0aH0udHNgKTtcblxuICByZXR1cm4gY29tcFBhdGg7XG59XG4vLyBlbmQgaGVscGVyIGZ1bmN0aW9ucy5cblxuZnVuY3Rpb24gdmFsaWRhdGVQcm9qZWN0KG9wdGlvbnM6IEFwcFNoZWxsT3B0aW9ucyk6IFJ1bGUge1xuICByZXR1cm4gKGhvc3Q6IFRyZWUsIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpID0+IHtcbiAgICBjb25zdCByb3V0ZXJPdXRsZXRDaGVja1JlZ2V4ID0gLzxyb3V0ZXJcXC1vdXRsZXQuKj8+KFtcXHNcXFNdKj8pPFxcL3JvdXRlclxcLW91dGxldD4vO1xuXG4gICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKGhvc3QpO1xuICAgIGNvbnN0IGFwcCA9IGdldEFwcEZyb21Db25maWcoY29uZmlnLCBvcHRpb25zLmNsaWVudEFwcCB8fCAnMCcpO1xuICAgIGlmIChhcHAgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKGZvcm1hdE1pc3NpbmdBcHBNc2coJ0NsaWVudCcsIG9wdGlvbnMuY2xpZW50QXBwKSk7XG4gICAgfVxuXG4gICAgY29uc3QgY29tcG9uZW50UGF0aCA9IGdldEJvb3RzdHJhcENvbXBvbmVudFBhdGgoaG9zdCwgYXBwKTtcbiAgICBjb25zdCB0bXBsID0gZ2V0Q29tcG9uZW50VGVtcGxhdGVJbmZvKGhvc3QsIGNvbXBvbmVudFBhdGgpO1xuICAgIGNvbnN0IHRlbXBsYXRlID0gZ2V0Q29tcG9uZW50VGVtcGxhdGUoaG9zdCwgY29tcG9uZW50UGF0aCwgdG1wbCk7XG4gICAgaWYgKCFyb3V0ZXJPdXRsZXRDaGVja1JlZ2V4LnRlc3QodGVtcGxhdGUpKSB7XG4gICAgICBjb25zdCBlcnJvck1zZyA9XG4gICAgICAgIGBQcmVyZXF1aXNpdGUgZm9yIGFwcCBzaGVsbCBpcyB0byBkZWZpbmUgYSByb3V0ZXItb3V0bGV0IGluIHlvdXIgcm9vdCBjb21wb25lbnQuYDtcbiAgICAgIGNvbnRleHQubG9nZ2VyLmVycm9yKGVycm9yTXNnKTtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKGVycm9yTXNnKTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGFkZFVuaXZlcnNhbEFwcChvcHRpb25zOiBBcHBTaGVsbE9wdGlvbnMpOiBSdWxlIHtcbiAgcmV0dXJuIChob3N0OiBUcmVlLCBjb250ZXh0OiBTY2hlbWF0aWNDb250ZXh0KSA9PiB7XG4gICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKGhvc3QpO1xuICAgIGNvbnN0IGFwcENvbmZpZyA9IGdldEFwcEZyb21Db25maWcoY29uZmlnLCBvcHRpb25zLnVuaXZlcnNhbEFwcCk7XG5cbiAgICBpZiAoYXBwQ29uZmlnICYmIGFwcENvbmZpZy5wbGF0Zm9ybSA9PT0gJ3NlcnZlcicpIHtcbiAgICAgIHJldHVybiBob3N0O1xuICAgIH0gZWxzZSBpZiAoYXBwQ29uZmlnICYmIGFwcENvbmZpZy5wbGF0Zm9ybSAhPT0gJ3NlcnZlcicpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKFxuICAgICAgICBgSW52YWxpZCBwbGF0Zm9ybSBmb3IgdW5pdmVyc2FsIGFwcCAoJHtvcHRpb25zLnVuaXZlcnNhbEFwcH0pLCB2YWx1ZSBtdXN0IGJlIFwic2VydmVyXCIuYCk7XG4gICAgfVxuXG4gICAgLy8gQ29weSBvcHRpb25zLlxuICAgIGNvbnN0IHVuaXZlcnNhbE9wdGlvbnMgPSB7XG4gICAgICAuLi5vcHRpb25zLFxuICAgICAgbmFtZTogb3B0aW9ucy51bml2ZXJzYWxBcHAsXG4gICAgfTtcblxuICAgIC8vIERlbGV0ZSBub24tdW5pdmVyc2FsIG9wdGlvbnMuXG4gICAgZGVsZXRlIHVuaXZlcnNhbE9wdGlvbnMudW5pdmVyc2FsQXBwO1xuICAgIGRlbGV0ZSB1bml2ZXJzYWxPcHRpb25zLnJvdXRlO1xuXG4gICAgcmV0dXJuIHNjaGVtYXRpYygndW5pdmVyc2FsJywgdW5pdmVyc2FsT3B0aW9ucykoaG9zdCwgY29udGV4dCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGFkZEFwcFNoZWxsQ29uZmlnKG9wdGlvbnM6IEFwcFNoZWxsT3B0aW9ucyk6IFJ1bGUge1xuICByZXR1cm4gKGhvc3Q6IFRyZWUpID0+IHtcbiAgICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoaG9zdCk7XG4gICAgY29uc3QgYXBwID0gZ2V0QXBwRnJvbUNvbmZpZyhjb25maWcsIG9wdGlvbnMuY2xpZW50QXBwIHx8ICcwJyk7XG5cbiAgICBpZiAoIWFwcCkge1xuICAgICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oZm9ybWF0TWlzc2luZ0FwcE1zZygnQ2xpZW50Jywgb3B0aW9ucy5jbGllbnRBcHApKTtcbiAgICB9XG5cbiAgICBpZiAoIW9wdGlvbnMucm91dGUpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKGBSb3V0ZSBpcyBub3QgZGVmaW5lZGApO1xuICAgIH1cblxuICAgIGFwcC5hcHBTaGVsbCA9IHtcbiAgICAgIGFwcDogb3B0aW9ucy51bml2ZXJzYWxBcHAsXG4gICAgICByb3V0ZTogb3B0aW9ucy5yb3V0ZSxcbiAgICB9O1xuXG4gICAgaG9zdC5vdmVyd3JpdGUoJy8uYW5ndWxhci1jbGkuanNvbicsIEpTT04uc3RyaW5naWZ5KGNvbmZpZywgbnVsbCwgMikpO1xuXG4gICAgcmV0dXJuIGhvc3Q7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGFkZFJvdXRlck1vZHVsZShvcHRpb25zOiBBcHBTaGVsbE9wdGlvbnMpOiBSdWxlIHtcbiAgcmV0dXJuIChob3N0OiBUcmVlKSA9PiB7XG4gICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKGhvc3QpO1xuICAgIGNvbnN0IGFwcCA9IGdldEFwcEZyb21Db25maWcoY29uZmlnLCBvcHRpb25zLmNsaWVudEFwcCB8fCAnMCcpO1xuICAgIGlmIChhcHAgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKGZvcm1hdE1pc3NpbmdBcHBNc2coJ0NsaWVudCcsIG9wdGlvbnMuY2xpZW50QXBwKSk7XG4gICAgfVxuICAgIGNvbnN0IG1vZHVsZVBhdGggPSBnZXRBcHBNb2R1bGVQYXRoKGhvc3QsIGFwcCk7XG4gICAgY29uc3QgbW9kdWxlU291cmNlID0gZ2V0U291cmNlRmlsZShob3N0LCBtb2R1bGVQYXRoKTtcbiAgICBjb25zdCBjaGFuZ2VzID0gYWRkSW1wb3J0VG9Nb2R1bGUobW9kdWxlU291cmNlLCBtb2R1bGVQYXRoLCAnUm91dGVyTW9kdWxlJywgJ0Bhbmd1bGFyL3JvdXRlcicpO1xuICAgIGNvbnN0IHJlY29yZGVyID0gaG9zdC5iZWdpblVwZGF0ZShtb2R1bGVQYXRoKTtcbiAgICBjaGFuZ2VzLmZvckVhY2goKGNoYW5nZTogSW5zZXJ0Q2hhbmdlKSA9PiB7XG4gICAgICByZWNvcmRlci5pbnNlcnRMZWZ0KGNoYW5nZS5wb3MsIGNoYW5nZS50b0FkZCk7XG4gICAgfSk7XG4gICAgaG9zdC5jb21taXRVcGRhdGUocmVjb3JkZXIpO1xuXG4gICAgcmV0dXJuIGhvc3Q7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldE1ldGFkYXRhUHJvcGVydHkobWV0YWRhdGE6IHRzLk5vZGUsIHByb3BlcnR5TmFtZTogc3RyaW5nKTogdHMuUHJvcGVydHlBc3NpZ25tZW50IHtcbiAgY29uc3QgcHJvcGVydGllcyA9IChtZXRhZGF0YSBhcyB0cy5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbikucHJvcGVydGllcztcbiAgY29uc3QgcHJvcGVydHkgPSBwcm9wZXJ0aWVzXG4gICAgLmZpbHRlcihwcm9wID0+IHByb3Aua2luZCA9PT0gdHMuU3ludGF4S2luZC5Qcm9wZXJ0eUFzc2lnbm1lbnQpXG4gICAgLmZpbHRlcigocHJvcDogdHMuUHJvcGVydHlBc3NpZ25tZW50KSA9PiB7XG4gICAgICBjb25zdCBuYW1lID0gcHJvcC5uYW1lO1xuICAgICAgc3dpdGNoIChuYW1lLmtpbmQpIHtcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXI6XG4gICAgICAgICAgcmV0dXJuIChuYW1lIGFzIHRzLklkZW50aWZpZXIpLmdldFRleHQoKSA9PT0gcHJvcGVydHlOYW1lO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbDpcbiAgICAgICAgICByZXR1cm4gKG5hbWUgYXMgdHMuU3RyaW5nTGl0ZXJhbCkudGV4dCA9PT0gcHJvcGVydHlOYW1lO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSlbMF07XG5cbiAgcmV0dXJuIHByb3BlcnR5IGFzIHRzLlByb3BlcnR5QXNzaWdubWVudDtcbn1cblxuZnVuY3Rpb24gYWRkU2VydmVyUm91dGVzKG9wdGlvbnM6IEFwcFNoZWxsT3B0aW9ucyk6IFJ1bGUge1xuICByZXR1cm4gKGhvc3Q6IFRyZWUpID0+IHtcbiAgICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoaG9zdCk7XG4gICAgY29uc3QgYXBwID0gZ2V0QXBwRnJvbUNvbmZpZyhjb25maWcsIG9wdGlvbnMudW5pdmVyc2FsQXBwKTtcbiAgICBpZiAoYXBwID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihmb3JtYXRNaXNzaW5nQXBwTXNnKCdVbml2ZXJzYWwvc2VydmVyJywgb3B0aW9ucy51bml2ZXJzYWxBcHApKTtcbiAgICB9XG4gICAgY29uc3QgbW9kdWxlUGF0aCA9IGdldFNlcnZlck1vZHVsZVBhdGgoaG9zdCwgYXBwKTtcbiAgICBpZiAobW9kdWxlUGF0aCA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oJ1VuaXZlcnNhbC9zZXJ2ZXIgbW9kdWxlIG5vdCBmb3VuZC4nKTtcbiAgICB9XG5cbiAgICBsZXQgbW9kdWxlU291cmNlID0gZ2V0U291cmNlRmlsZShob3N0LCBtb2R1bGVQYXRoKTtcbiAgICBpZiAoIWlzSW1wb3J0ZWQobW9kdWxlU291cmNlLCAnUm91dGVzJywgJ0Bhbmd1bGFyL3JvdXRlcicpKSB7XG4gICAgICBjb25zdCByZWNvcmRlciA9IGhvc3QuYmVnaW5VcGRhdGUobW9kdWxlUGF0aCk7XG4gICAgICBjb25zdCByb3V0ZXNDaGFuZ2UgPSBpbnNlcnRJbXBvcnQobW9kdWxlU291cmNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1JvdXRlcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0Bhbmd1bGFyL3JvdXRlcicpIGFzIEluc2VydENoYW5nZTtcbiAgICAgIGlmIChyb3V0ZXNDaGFuZ2UudG9BZGQpIHtcbiAgICAgICAgcmVjb3JkZXIuaW5zZXJ0TGVmdChyb3V0ZXNDaGFuZ2UucG9zLCByb3V0ZXNDaGFuZ2UudG9BZGQpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpbXBvcnRzID0gZ2V0U291cmNlTm9kZXMobW9kdWxlU291cmNlKVxuICAgICAgICAuZmlsdGVyKG5vZGUgPT4gbm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkltcG9ydERlY2xhcmF0aW9uKVxuICAgICAgICAuc29ydCgoYSwgYikgPT4gYS5nZXRTdGFydCgpIC0gYi5nZXRTdGFydCgpKTtcbiAgICAgIGNvbnN0IGluc2VydFBvc2l0aW9uID0gaW1wb3J0c1tpbXBvcnRzLmxlbmd0aCAtIDFdLmdldEVuZCgpO1xuICAgICAgY29uc3Qgcm91dGVUZXh0ID1cbiAgICAgICAgYFxcblxcbmNvbnN0IHJvdXRlczogUm91dGVzID0gWyB7IHBhdGg6ICcke29wdGlvbnMucm91dGV9JywgY29tcG9uZW50OiBBcHBTaGVsbENvbXBvbmVudCB9XTtgO1xuICAgICAgcmVjb3JkZXIuaW5zZXJ0UmlnaHQoaW5zZXJ0UG9zaXRpb24sIHJvdXRlVGV4dCk7XG4gICAgICBob3N0LmNvbW1pdFVwZGF0ZShyZWNvcmRlcik7XG4gICAgfVxuXG4gICAgbW9kdWxlU291cmNlID0gZ2V0U291cmNlRmlsZShob3N0LCBtb2R1bGVQYXRoKTtcbiAgICBpZiAoIWlzSW1wb3J0ZWQobW9kdWxlU291cmNlLCAnUm91dGVyTW9kdWxlJywgJ0Bhbmd1bGFyL3JvdXRlcicpKSB7XG4gICAgICBjb25zdCByZWNvcmRlciA9IGhvc3QuYmVnaW5VcGRhdGUobW9kdWxlUGF0aCk7XG4gICAgICBjb25zdCByb3V0ZXJNb2R1bGVDaGFuZ2UgPSBpbnNlcnRJbXBvcnQobW9kdWxlU291cmNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1JvdXRlck1vZHVsZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0Bhbmd1bGFyL3JvdXRlcicpIGFzIEluc2VydENoYW5nZTtcblxuICAgICAgaWYgKHJvdXRlck1vZHVsZUNoYW5nZS50b0FkZCkge1xuICAgICAgICByZWNvcmRlci5pbnNlcnRMZWZ0KHJvdXRlck1vZHVsZUNoYW5nZS5wb3MsIHJvdXRlck1vZHVsZUNoYW5nZS50b0FkZCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG1ldGFkYXRhQ2hhbmdlID0gYWRkU3ltYm9sVG9OZ01vZHVsZU1ldGFkYXRhKFxuICAgICAgICAgIG1vZHVsZVNvdXJjZSwgbW9kdWxlUGF0aCwgJ2ltcG9ydHMnLCAnUm91dGVyTW9kdWxlLmZvclJvb3Qocm91dGVzKScpO1xuICAgICAgaWYgKG1ldGFkYXRhQ2hhbmdlKSB7XG4gICAgICAgIG1ldGFkYXRhQ2hhbmdlLmZvckVhY2goKGNoYW5nZTogSW5zZXJ0Q2hhbmdlKSA9PiB7XG4gICAgICAgICAgcmVjb3JkZXIuaW5zZXJ0UmlnaHQoY2hhbmdlLnBvcywgY2hhbmdlLnRvQWRkKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBob3N0LmNvbW1pdFVwZGF0ZShyZWNvcmRlcik7XG4gICAgfVxuXG5cbiAgICByZXR1cm4gaG9zdDtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYWRkU2hlbGxDb21wb25lbnQob3B0aW9uczogQXBwU2hlbGxPcHRpb25zKTogUnVsZSB7XG4gIHJldHVybiAoaG9zdDogVHJlZSwgY29udGV4dDogU2NoZW1hdGljQ29udGV4dCkgPT4ge1xuXG4gICAgY29uc3QgY29tcG9uZW50T3B0aW9ucyA9IHtcbiAgICAgIG5hbWU6ICdhcHAtc2hlbGwnLFxuICAgICAgbW9kdWxlOiBvcHRpb25zLnJvb3RNb2R1bGVGaWxlTmFtZSxcbiAgICB9O1xuXG4gICAgcmV0dXJuIHNjaGVtYXRpYygnY29tcG9uZW50JywgY29tcG9uZW50T3B0aW9ucykoaG9zdCwgY29udGV4dCk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChvcHRpb25zOiBBcHBTaGVsbE9wdGlvbnMpOiBSdWxlIHtcbiAgcmV0dXJuIGNoYWluKFtcbiAgICB2YWxpZGF0ZVByb2plY3Qob3B0aW9ucyksXG4gICAgYWRkVW5pdmVyc2FsQXBwKG9wdGlvbnMpLFxuICAgIGFkZEFwcFNoZWxsQ29uZmlnKG9wdGlvbnMpLFxuICAgIGFkZFJvdXRlck1vZHVsZShvcHRpb25zKSxcbiAgICBhZGRTZXJ2ZXJSb3V0ZXMob3B0aW9ucyksXG4gICAgYWRkU2hlbGxDb21wb25lbnQob3B0aW9ucyksXG4gIF0pO1xufVxuIl19