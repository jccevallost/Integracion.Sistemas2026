import 'package:flutter_test/flutter_test.dart';

import 'package:vuelos_mobile/main.dart';

void main() {
  testWidgets('Marketplace mobile shell renders', (WidgetTester tester) async {
    await tester.pumpWidget(const VuelosMobileApp());

    expect(find.text('Sistema de Vuelos'), findsOneWidget);
    expect(find.text('Buscar'), findsWidgets);
    expect(find.text('Mis Viajes'), findsOneWidget);
    expect(find.text('Cuenta'), findsOneWidget);
    await tester.tap(find.text('Cuenta').last);
    await tester.pump();
    expect(find.text('Iniciar sesion'), findsOneWidget);
  });
}
