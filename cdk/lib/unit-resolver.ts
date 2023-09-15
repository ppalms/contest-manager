// TODO create an abstration for unit resolvers
/**
 * eg
 * 
 * 
    const getOrganizationFunction = new AppsyncFunction(
      this,
      'GetOrganizationFunction',
      {
        api,
        name: 'getOrganization',
        dataSource: organizationDataSource,
        code: Code.fromAsset(
          path.join(__dirname, '..', 'src', 'resolvers', 'getOrganization.js')
        ),
        runtime: FunctionRuntime.JS_1_0_0,
      }
    );

 */